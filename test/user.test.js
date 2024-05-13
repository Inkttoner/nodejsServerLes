process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
process.env.LOGLEVEL = 'trace'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const assert = require('assert')
const logger = require('../src/util/logger')
require('dotenv').config()
const db = require('../src/dao/mysql-db')

chai.should()
chai.use(chaiHttp)

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "a.name@server.nl", "Secret12", "street", "city");'
    const INSERT_USER2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "first", "last", "b.name@server.nl", "Secret12", "street", "city");'

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

describe('Example MySql testcase', () => {
    //
    // informatie over before, after, beforeEach, afterEach:
    // https://mochajs.org/#hooks
    //
    before((done) => {
        logger.debug(
            'before: hier zorg je eventueel dat de precondities correct zijn'
        )
        logger.debug('before done')
        done()
    })

    describe('UC201 Reading a user should succeed', () => {
        //
        beforeEach((done) => {
            logger.debug('beforeEach called')
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            db.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        logger.debug('beforeEach done')
                        done()
                    }
                )
            })
        })
        it.skip('TC-201-1 Verplicht veld ontbreekt', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    // firstName: 'Voornaam', ontbreekt
                    lastName: "de Kruijf",
                    emailAdress: "c.name@server.nl",
                    password: "Geheim12",
                    street: "de Lind",
                    city: "Oisterwijk",
                    phoneNumber: "0658774685"

                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').equals(400)
                    res.body.should.have.property('message').equals('Missing or incorrect firstName field')
                    res.body.should.have.property('data').that.is.a('object').that.is.empty
                    done()
                })
        })
        it('TC-201-2 Niet-valide email adres', (done) => {
            chai.request(server)
                .post( '/api/user')
                .send({
                    firstName: "first",
                    lastName: "de Kruijf",
                    emailAdress: "c.name.server.nl",
                    password: "Geheim12",
                    street: "de Lind",
                    city: "Oisterwijk",
                    phoneNumber: "0658774685"
                })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status').equals(400)
                    res.body.should.have.property('message').equals('Invalid email format')
                    res.body.should.have.property('data').that.is.a('object').that.is.empty
                    done()
                })
        })
        it('TC-201-3 Niet-valide password', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "first",
                    lastName: "de Kruijf",
                    emailAdress: "c.name@server.nl",
                    password: "geheim12",
                    street: "de Lind",
                    city: "Oisterwijk",
                    phoneNumber: "0658774685"
                })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status').equals(400)
                    res.body.should.have.property('message').equals('Password must contain at least 8 characters, 1 uppercase letter, and 1 digit')
                    res.body.should.have.property('data').that.is.a('object').that.is.empty
                    done()
                })
        })
        it('TC-201-4 gebruiker bestaat al', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "first",
                    lastName: "de Kruijf",
                    emailAdress: "a.name@server.nl",
                    password: "Geheim12",
                    street: "de Lind",
                    city: "Oisterwijk",
                    phoneNumber: "0658774685"
                })
                .end((err, res) => {
                    res.should.have.status(403)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status').equals(403)
                    res.body.should.have.property('message').equals('Email already exists in the database')
                    res.body.should.have.property('data').that.is.a('object').that.is.empty
                    done()
                })
        })

        it('TC-201-5 gebruiker succesvol geregistreed', (done) => {
            chai.request(server)
                .post('/api/user')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message', 'data')
                    res.body.status.should.be.a('number')

                    const data = res.body.data

                    data.should.be.an('array').that.has.lengthOf(1)
                    data[0].should.be.an('object').that.has.all.keys(
                        'id',
                        'firstName',
                        'lastName',
                        'emailAdress',
                        'password',
                        'street',
                        'city'
                    )
                    data[0].id.should.be.a('number').that.equals(1)
                    data[0].firstName.should.be.a('string').that.equals('first')
                    data[0].lastName.should.be.a('string').that.equals('last')
                    data[0].emailAdress.should.be
                        .a('string')
                        .that.equals('name@server.nl')
                    data[0].password.should.be.a('string').that.equals('secret')
                    done()
                })
        })
       
    })
})
