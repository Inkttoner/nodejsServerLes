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
const endpointToTest = '/api/meal'
describe('Meal testcases', () => {
    describe('TC ')

})