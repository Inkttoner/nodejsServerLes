const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const mealController = require('../controllers/meal.controller')
const logger = require('../util/logger')
const database = require('../dao/inmem-db')
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

const validateUserCreateChaiAssert = (req, res, next) => {
    try {
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
const validateMailExists = (req, res, next) => {
    const existingUser = database._data.find(
        (user) => user.emailAdress === req.body.emailAdress
    )
    if (existingUser) {
        next({
            status: 403,
            message: 'Email already exists in the database',
            data: {}
        })
    } else {
        next()
    }
}
const validatePhoneNumber = (req, res, next) => {
    const phoneRegex = /^06[-\s]?\d{8}$/;
    if (!phoneRegex.test(req.body.phoneNumber)) {
        next({
            status: 400,
            message: 'Phone number must contain exactly 10 digits and start with 06',
            data: {}
        });
    } else {
        next();
    }
}
const validatePassword = (req, res, next) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
        next({
            status: 400,
            message: 'Password must contain at least 8 characters, 1 uppercase letter, and 1 digit',
            data: {}
        });
    } else {
        next();
    }
}
const validateEmailFormat = (req, res, next) => {
    const emailRegex = /^[a-z]\.[a-z]{2,}@([a-z]{2,}\.){1}[a-z]{2,3}$/i;
    if (!emailRegex.test(req.body.emailAdress)) {
        next({
            status: 400,
            message: 'Invalid email format',
            data: {}
        });
    } else {
        next();
    }
}

// Userroutes
router.post(
    '/api/user',
    validateUserCreateChaiAssert,
    validateEmailFormat,
    validatePhoneNumber,
    validatePassword,
    validateMailExists,
    userController.create
)
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

router.put('/api/user/:userId', validateToken, userController.update)
router.delete('/api/user/:userId', validateToken, userController.delete)
// meal routes
router.get('/api/meal', mealController.getAll)
router.post('/api/meal', validateToken, mealController.create)
router.get('/api/meal/:mealId', mealController.getById)
router.delete('/api/meal/:mealId', validateToken, mealController.delete)
router.use(notFound)
module.exports = router
