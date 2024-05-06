const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user'

describe('UC201 Registreren als nieuwe user', () => {
    /**
     * Voorbeeld van een beforeEach functie.
     * Hiermee kun je code hergebruiken of initialiseren.
     */
    beforeEach((done) => {
        console.log('Before each test')
        done()
    })

    /**
     * Hier starten de testcases
     */
    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                // firstName: 'Voornaam', ontbreekt
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl'
            })
            .end((err, res) => {
                /**
                 * Voorbeeld uitwerking met chai.expect
                 */
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect firstName field')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-2 Niet-valide email adres', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'v.a.server.nl'
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('status').equals(400)
                res.body.should.have
                    .property('message')
                    .equals('emailAdress must look like example@email.com')
                res.body.should.have.property('data').that.is.a('object').that
                    .is.empty
                done()
            })
    })

    it.skip('TC-201-3 Niet-valide password', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    it('TC-201-4 Gebruiker bestaat al', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Marieke',
                lastName: 'Jansen',
                emailAdress: 'hvd@server.nl'
            })
            .end((err, res) => {
                res.should.have.status(403)
                res.body.should.be.a('object')
                res.body.should.have.property('status').equals(400)
                res.body.should.have
                    .property('message')
                    .equals('User already exists')
                res.body.should.have.property('data').that.is.a('object').that
                    .is.empty
                done()
            })
        done()
    })

    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl'
            })
            .end((err, res) => {
                res.should.have.status(201)
                res.body.should.be.a('object')

                res.body.should.have.property('data').that.is.a('object')
                res.body.should.have.property('message').that.is.a('string')

                const data = res.body.data
                data.should.have.property('firstName').equals('Voornaam')
                data.should.have.property('lastName').equals('Achternaam')
                data.should.have.property('emailAdress')
                data.should.have.property('id').that.is.a('number')

                done()
            })
    })
    it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
        chai.request(server)
            .get(endpointToTest + '/-1')
            .end((err, res) => {
                res.should.have.status(404)
                res.body.should.be.a('object')
                res.body.should.have.property('status').equals(404)
                res.body.should.have
                    .property('message')
                    .equals(
                        'Error: id -1 does not exist! Please enter an id below 2'
                    )
                res.body.should.have.property('data').that.is.a('object').that
                    .is.empty
                done()
            })
    })

    it('TC-204-3  Gebruiker-ID bestaat', (done) => {
        chai.request(server)
            .get(endpointToTest + '/1')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('data').that.is.a('object')
                res.body.data.should.have.property('id').equals(1)
                done()
            })
    })
    it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
        chai.request(server)
            .delete(endpointToTest + '/1')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('data').that.is.a('object')
                res.body.data.should.have.property('id').equals(1)
                done()
            })
    })
})
