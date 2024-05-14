const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const mealController = require('../controllers/meal.controller')
const logger = require('../util/logger')
const database = require('../dao/inmem-db')
const db = require('../dao/mysql-db')
const validateToken = require('./authentication.routes').validateToken
const validateToken2 = require('./authentication.routes').validateToken2
// const showLog = require('./authentication.routes').showLog

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}
function showLog(req, res, next) {
    logger.info('Log message')
    next()
}

// Input validation function 2 met gebruik van assert
const validateUserCreateChaiShould = (req, res, next) => {
    try {
        req.body.firstName.should.not.be.empty.and.a('string')
        req.body.lastName.should.not.be.empty.and.a('string')
        req.body.emailAdress.should.not.be.empty.and.a('string').and.match(/@/)
        next()
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateUser = (req, res, next) => {
    try {
        //Assert first name
        assert(req.body.firstName, 'Missing or incorrect firstName field')
        assert(req.body.firstName.length > 0, 'firstName must not be empty')
        assert(
            typeof req.body.firstName === 'string',
            'firstName must be a string'
        )
        assert(
            /^[a-zA-Z]+$/.test(req.body.firstName),
            'firstName must be a string'
        )
        //Assert last name
        assert(req.body.lastName, 'Missing or incorrect lastName field')
        assert(req.body.lastName.length > 0, 'lastName must not be empty')
        assert(
            typeof req.body.lastName === 'string',
            'lastName must be a string'
        )
        assert(
            /^[a-zA-Z\s]+$/.test(req.body.lastName),
            'lastName must be a string'
        )
        //Assert emailAdress
        assert(req.body.emailAdress, 'Missing or incorrect emailAdress field')
        assert(req.body.emailAdress.length > 0, 'emailAdress must not be empty')
        assert(
            /^[a-z]\.[a-z]{2,}@([a-z]{2,}\.){1}[a-z]{2,3}$/i.test(req.body.emailAdress),
            'Invalid email format'
        )
        //Assert phoneNumber
        assert(req.body.phoneNumber, 'Missing or incorrect phoneNumber field')
        assert(req.body.phoneNumber.length > 0, 'phoneNumber must not be empty')
        assert(
            /^06[-\s]?\d{8}$/.test(req.body.phoneNumber),
            'Invalid phone number'
        )
        //Assert password
        assert(req.body.password, 'Missing or incorrect password field')
        assert(req.body.password.length > 0, 'password must not be empty')
        assert(
            /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(req.body.password), 
            'Password must contain at least 8 characters, 1 uppercase letter, and 1 digit'
        )

        logger.trace('User successfully validated')
        next()
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}
router.get('/api/user', validateToken, userController.getAll)
router.get('/api/user/profile', validateToken, userController.getProfile)
router.get('/api/user/:userId', validateToken, userController.getById)
router.get('/api/info', (req, res) => {
    console.log('GET /api/info')
    const info = {
        name: 'Share a Meal API',
        version: '0.1.0',
        description:
            'This is my first Nodejs Express server for the share a meal case'
    }
    res.json(info)
})
router.get('/', (req, res) => {
    res.redirect('/api/info')
})

router.put('/api/user/:userId', validateToken, validateUser, userController.update)
router.delete('/api/user/:userId', validateToken, userController.delete)
// meal routes
router.get('/api/meal', mealController.getAll)
router.post('/api/meal', validateToken, mealController.create)
router.get('/api/meal/:mealId', mealController.getById)
router.delete('/api/meal/:mealId', validateToken, mealController.delete)
router.use(notFound)
module.exports = router
