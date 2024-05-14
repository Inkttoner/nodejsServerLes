require('dotenv').config()
process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
process.env.LOGLEVEL = 'trace'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'DitIsEenGeheim'
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const assert = require('assert')
const logger = require('../src/util/logger')
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
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`,`phoneNumber` ) VALUES' +
    '(1, "first", "last", "a.name@server.nl", "Secret12", "street", "city","0658449587");'
const INSERT_USER2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`, `phoneNumber` ) VALUES' +
    '(2, "first", "last", "b.name@server.nl", "Secret12", "street", "city", "0658449587");'

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

const endpointToTest = '/api/user'

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
        it('TC-201-1 Verplicht veld ontbreekt', (done) => {
            chai.request(server)
                .post(endpointToTest)
                .send({
                    // firstName: 'Voornaam', ontbreekt
                    lastName: 'de Kruijf',
                    emailAdress: 'c.name@server.nl',
                    password: 'Geheim12',
                    street: 'de Lind',
                    city: 'Oisterwijk',
                    phoneNumber: '0658774685'
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').equals(400)
                    res.body.should.have
                        .property('message')
                        .equals('Missing or incorrect firstName field')
                    res.body.should.have.property('data').that.is.a('object')
                        .that.is.empty
                    done()
                })
        })
        it('TC-201-2 Niet valide email adres', (done) => {
            chai.request(server)
                .post(endpointToTest)
                .send({
                    firstName: 'first',
                    lastName: 'de Kruijf',
                    emailAdress: 'c.name.server.nl',
                    password: 'Geheim12',
                    street: 'de Lind',
                    city: 'Oisterwijk',
                    phoneNumber: '0658774685'
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.body.should.be.an('object')
                    res.body.should.have.property('status').equals(400)
                    res.body.should.have
                        .property('message')
                        .equals('Invalid email format')
                    res.body.should.have.property('data').that.is.a('object')
                        .that.is.empty
                    done()
                })
        })
        it('TC-201-3 Niet-valide password', (done) => {
            chai.request(server)
                .post(endpointToTest)
                .send({
                    firstName: 'first',
                    lastName: 'de Kruijf',
                    emailAdress: 'c.name@server.nl',
                    password: 'geheim12',
                    street: 'de Lind',
                    city: 'Oisterwijk',
                    phoneNumber: '0658774685'
                })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status').equals(400)
                    res.body.should.have
                        .property('message')
                        .equals(
                            'Password must contain at least 8 characters, 1 uppercase letter, and 1 digit'
                        )
                    res.body.should.have.property('data').that.is.a('object')
                        .that.is.empty
                    done()
                })
        })
        it('TC-201-4 gebruiker bestaat al', (done) => {
            chai.request(server)
                .post(endpointToTest)
                .send({
                    firstName: 'first',
                    lastName: 'de Kruijf',
                    emailAdress: 'a.name@server.nl',
                    password: 'Geheim12',
                    street: 'de Lind',
                    city: 'Oisterwijk',
                    phoneNumber: '0658774685'
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(403)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status').equals(403)
                    res.body.should.have
                        .property('message')
                        .equals('Email already exists in the database')
                    res.body.should.have.property('data').that.is.a('object')
                        .that.is.empty
                    done()
                })
        })

        it('TC-201-5 gebruiker succesvol geregistreed', (done) => {
            chai.request(server)
                .post(endpointToTest)
                .send({
                    firstName: 'first',
                    lastName: 'de Kruijf',
                    emailAdress: 'c.dekruijf@server.nl',
                    password: 'Geheim12',
                    street: 'de Lind',
                    city: 'Oisterwijk',
                    phoneNumber: '0658774685'
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(201)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message', 'data')
                    res.body.status.should.be.a('number')
                    res.body.message.should.be.a('string')
                    const data = res.body.data

                    data.should.be.an('array').that.has.lengthOf(1)
                    data[0].should.be
                        .an('object')
                        .that.has.all.keys(
                            'id',
                            'firstName',
                            'lastName',
                            'emailAdress',
                            'password',
                            'street',
                            'city',
                            'phoneNumber',
                            'isActive'
                        )
                    data[0].id.should.be.a('number').that.equals(42)
                    data[0].firstName.should.be.a('string').that.equals('first')
                    data[0].lastName.should.be
                        .a('string')
                        .that.equals('de Kruijf')
                    data[0].emailAdress.should.be
                        .a('string')
                        .that.equals('c.dekruijf@server.nl')
                    data[0].password.should.be
                        .a('string')
                        .that.equals('Geheim12')
                    data[0].street.should.be.a('string').that.equals('de Lind')
                    data[0].city.should.be.a('string').that.equals('Oisterwijk')
                    data[0].phoneNumber.should.be
                        .a('string')
                        .that.equals('0658774685')
                    data[0].isActive.should.be.a('boolean').that.equals(true)
                    done()
                })
        })
    })
    describe('UC202 Opvragen van overzicht van alle users', () => {
        //
        beforeEach((done) => {
            logger.debug('beforeEach called')
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            db.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_USER2,
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
        it('TC-202-1 Toon alle gebruikers', (done) => {
            const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            chai.request(server)
                .get(endpointToTest)
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an
                        .an('object')
                        .that.has.all.keys('status', 'message', 'data')
                    res.body.status.should.be.a('number')
                    res.body.data.should.be
                        .an('array')
                        .that.is.not.empty.and.is.lengthOf.above(2)
                    res.body.message.should.contain('Found 2 users')
                    done()
                })
        })

        it('TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden.', (done) => {
            const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            chai.request(server)
                .get(
                    endpointToTest +
                        '?nonExistentField=first&nonExistentField2=last'
                )
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an
                        .an('object')
                        .that.has.all.keys('status', 'message', 'data')
                    res.body.status.should.be.a('number')
                    res.body.data.should.be
                        .an('array')
                        .that.is.not.empty.and.is.lengthOf.above(2)
                    res.body.message.should.contain('Invalid query fields')
                    done()
                })
        })

        it('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld `isActive`=fals', (done) => {
            const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            chai.request(server)
                .get(endpointToTest + '?isActive=0')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an
                        .an('object')
                        .that.has.all.keys('status', 'message', 'data')
                    res.body.status.should.be.a('number')
                    res.body.data.should.be.an('array').that.is.empty
                    res.body.message.should.contain('Found 0 users')
                    done()
                })
        })

        it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld `isActive`=true', (done) => {
            const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            chai.request(server)
                .get(endpointToTest + '?isActive=1')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an
                        .an('object')
                        .that.has.all.keys('status', 'message', 'data')
                    res.body.status.should.be.a('number')
                    res.body.data.should.be
                        .an('array')
                        .that.is.not.empty.and.is.lengthOf.above(2)
                    res.body.message.should.contain('Found 2 users')
                    done()
                })
        })

        it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden', (done) => {
            const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            chai.request(server)
                .get(endpointToTest + '?firstName=first&lastName=last')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an
                        .an('object')
                        .that.has.all.keys('status', 'message', 'data')
                    res.body.status.should.be.a('number')
                    res.body.data.should.be
                        .an('array')
                        .that.is.not.empty.and.is.lengthOf.above(2)
                    res.body.message.should.contain('Found 2 users')
                    done()
                })
        })
    })
    describe('UC-203 opvragen van gebruikersprofiel', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called')
            db.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_USER2,
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

            it('TC-203-1 ongeldig token', (done) => {
                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
                chai.request(server)
                    .get(endpointToTest + '/1')
                    .set('Authorization', 'Bearer ' + 'wrongToken')
                    .end((err, res) => {
                        assert.ifError(err)
                        res.should.have.status(401)
                        res.body.should.be.an
                            .an('object')
                            .that.has.all.keys('status', 'message', 'data')
                        res.body.status.should.be.a('number')
                        res.body.data.should.be.an('object').that.is.empty
                        res.body.message.should.contain('Not authorized!')
                        done()
                    })
            })
            it('TC-203-2 gebruiker is ingelogd met geldig token', (done) => {
                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
                chai.request(server)
                    .get(endpointToTest + '/1')
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                        assert.ifError(err)
                        res.should.have.status(200)
                        res.body.should.be.an
                            .an('object')
                            .that.has.all.keys('status', 'message', 'data')
                        res.body.status.should.be.a('number')
                        res.body.data.should.be.an('object').that.is.not.empty
                        res.body.message.should.contain(
                            'Found user with id: 1.'
                        )
                        res.body.data.firstName.should.be
                            .a('string')
                            .that.equals('first')
                        res.body.data.lastName.should.be
                            .a('string')
                            .that.equals('last')
                        res.body.data.emailAdress.should.be
                            .a('string')
                            .that.equals('a.name@server.nl')
                        res.body.data.password.should.be
                            .a('string')
                            .that.equals('Secret12')
                        res.body.data.street.should.be
                            .a('string')
                            .that.equals('street')
                        res.body.data.city.should.be
                            .a('string')
                            .that.equals('city')
                        res.body.data.phoneNumber.should.be
                            .a('string')
                            .that.equals('0658449587')
                        done()
                    })
            })
        })
    })
        describe('UC-204 opvragen van usergegevens bij ID', () => {
            beforeEach((done) => {
                logger.debug('beforeEach called')
                db.getConnection(function (err, connection) {
                    if (err) throw err // not connected!

                    // Use the connection
                    connection.query(
                        CLEAR_DB + INSERT_USER + INSERT_USER2,
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

            it('TC-204-1 ongeldig token', (done) => {
                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
                chai.request(server)
                    .get(endpointToTest + '/1')
                    .set('Authorization', 'Bearer ' + 'wrongToken')
                    .end((err, res) => {
                        assert.ifError(err)
                        res.should.have.status(401)
                        res.body.should.be.an
                            .an('object')
                            .that.has.all.keys('status', 'message', 'data')
                        res.body.status.should.be.a('number')
                        res.body.data.should.be.an('object').that.is.empty
                        res.body.message.should.contain('Not authorized!')
                        done()
                    })
            })

            it('TC-204-2 user id bestaat niet', (done) => {
                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
                chai.request(server)
                    .get(endpointToTest + '/1000')
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                        assert.ifError(err)
                        res.should.have.status(404)
                        res.body.should.be.an
                            .an('object')
                            .that.has.all.keys('status', 'message', 'data')
                        res.body.status.should.be.a('number')
                        res.body.data.should.be.an('object').that.is.empty
                        res.body.message.should.contain(
                            'No user found with id 1000.'
                        )
                        done()
                    })
            })

            it('TC-204-3 user id bestaat', (done) => {
                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
                chai.request(server)
                    .get(endpointToTest + '/1')
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                        assert.ifError(err)
                        res.should.have.status(200)
                        res.body.should.be.an
                            .an('object')
                            .that.has.all.keys('status', 'message', 'data')
                        res.body.status.should.be.a('number')
                        res.body.data.should.be.an('array').that.has.lengthOf(1)
                        res.body.message.should.contain(
                            'Found 1 user.'
                        )
                        const data = res.body.data
                        data[0].should.be
                            .an('object')
                            .that.has.all.keys(
                                'id',
                                'firstName',
                                'lastName',
                                'emailAdress',
                                'street',
                                'city',
                                'phoneNumber',
                                'isActive'
                            )
                        data[0].id.should.be.a('number').that.equals(1)
                        data[0].firstName.should.be
                            .a('string')
                            .that.equals('first')
                        data[0].lastName.should.be
                            .a('string')
                            .that.equals('last')
                        data[0].emailAdress.should.be
                            .a('string')
                            .that.equals('a.name@server.nl')
                        data[0].street.should.be
                            .a('string')
                            .that.equals('street')
                        data[0].city.should.be
                            .a('string')
                            .that.equals('city')
                        data[0].phoneNumber.should.be
                            .a('string')
                            .that.equals('0658449587')
                        data[0].isActive.should.be
                            .a('boolean')
                            .that.equals(true)
                        done()
                    })
            })
        })
        describre('UC-205 updaten van usergegevens', () => {
            beforeEach((done) => {
                logger.debug('beforeEach called')
                db.getConnection(function (err, connection) {
                    if (err) throw err // not connected!

                    // Use the connection
                    connection.query(
                        CLEAR_DB + INSERT_USER + INSERT_USER2,
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
            it('TC-205-1 verplicht veld `emailAddress ontbreekt`', (done) => {
                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
                chai.request(server)
                    .put(endpointToTest + '/1')
                    .set('Authorization', 'Bearer ' + token)
                    .send({
                        firstName: 'first',
                        lastName: 'last',
                        password: 'Secret12',
                        street: 'street',
                        city: 'city',
                        phoneNumber: '0658449587'
                    })
                    .end((err, res) => {
                        assert.ifError(err)
                        res.should.have.status(400)
                        res.body.should.be.an
                            .an('object')
                            .that.has.all.keys('status', 'message', 'data')
                        res.body.status.should.be.a('number')
                        res.body.data.should.be.an('object').that.is.empty
                        res.body.message.should.contain(
                            'Missing or incorrect emailAdress field'
                        )
                        done()
                    })
            })
            it('TC-205-1 de gebruiker is niet de eigenaar van de data', (done) => {
                const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
                chai.request(server)
                    .put(endpointToTest + '/2')
                    .set('Authorization', 'Bearer ' + token)
                    .send({
                        firstName: 'first',
                        lastName: 'last',
                        emailAdress: 'c.name@server.nl',
                        street: 'street',
                        city: 'city',
                        phoneNumber: '0658449587'
        })
        .end((err, res) => {
            assert.ifError(err)
            res.should.have.status(403)
            res.body.should.be.an
                .an('object')
                .that.has.all.keys('status', 'message', 'data')
            res.body.status.should.be.a('number')
            res.body.data.should.be.an('object').that.is.empty
            res.body.message.should.contain('Unauthorized')
            done()
        })
    })
    it('TC-205-3 Niet-valide telefoonnummer', (done) => {
        const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
        chaiServer.request(server)
            .put(endpointToTest + '/1')
            .set('Authorization', 'Bearer ' + token)
            .send({
                firstName: "first",
                lastName: "last",
                emailAdress: "c.name@gmail.com",
                isActive: 1,
                password: "Wachtwoord12",
                phoneNumber: "not a valid phone number",
                roles: "editor"
            })
            .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(400);
                res.body.should.be.an.an('object')
                    .that.has.all.keys('status', 'message', 'data');
                res.body.status.should.be.a('number');
                res.body.data.should.be.an('object').that.is.empty;
                res.body.message.should.contain("Invalid phone number");
                done();
            });
    }); 
    it('TC-205-4 gebruiker bestaat niet', (done) => {
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
        chai.request(server)
            .put(endpointToTest + '/1000')
            .set('Authorization', 'Bearer ' + token)
            .send({
                firstName: 'first',
                lastName: 'last',
                emailAdress: 'c.name@server.nl'
            })
            .end((err, res) => {
                assert.ifError(err)
                res.should.have.status(404)
                res.body.should.be.an
                    .an('object')
                    .that.has.all.keys('status', 'message', 'data')
                res.body.status.should.be.a('number')
                res.body.data.should.be.an('object').that.is.empty
                res.body.message.should.contain('User not found')
                done()
            })
        })
        it('TC-205-5 niet ingelogd', (done) => {
            const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
        chai.request(server)
            .put(endpointToTest + '/1000')
            .send({
                firstName: 'first',
                lastName: 'last',
                emailAdress: 'c.name@server.nl'
            })
            .end((err, res) => {
                assert.ifError(err)
                res.should.have.status(401)
                res.body.should.be.an
                    .an('object')
                    .that.has.all.keys('status', 'message', 'data')
                res.body.status.should.be.a('number')
                res.body.data.should.be.an('object').that.is.empty
                res.body.message.should.contain('Authorization header missing!')
                done()
            })
        })
        it('TC-205-6 gebruiker succesvol geupdate', (done) => {
            const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            chai.request(server)
                .put(endpointToTest + '/1')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    firstName: 'first changed',
                    lastName: 'last',
                    emailAdress: 'c.name@server.nl',
                    street: 'street',
                    city: 'city',
                    phoneNumber: '0658449587'
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an
                        .an('object')
                        .that.has.all.keys('status', 'message', 'data')
                    res.body.status.should.be.a('number')
                    res.body.data.should.be.an('object').that.is.empty
                    res.body.message.should.contain('User with id 1 updated.')
                    done()
                })
            })
    })
})
