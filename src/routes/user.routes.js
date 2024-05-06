const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const logger = require('../util/logger')
const database = require('../dao/inmem-db')

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
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

        assert(req.body.emailAdress, 'Missing or incorrect emailAdress field')
        assert(req.body.emailAdress.length > 0, 'emailAdress must not be empty')
        assert(
            typeof req.body.emailAdress === 'string',
            'emailAdress must be a string'
        )
        assert(
            /@/.test(req.body.emailAdress),
            'emailAdress must look like example@email.com'
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

// Userroutes
router.post(
    '/api/user',
    validateUserCreateChaiAssert,
    validateMailExists,
    userController.create
)
router.get('/api/user', userController.getAll)
router.get('/api/user/:userId', userController.getById)
router.get('/api/info', (req, res) => {
    console.log('GET /api/info')
    const info = {
        name: 'My Nodejs Express server',
        version: '0.0.1',
        description: 'This is a simple Nodejs Express server'
    }
    res.json(info)
})
router.get('/', (req, res) => {
    res.redirect('/api/info')
})
router.put('/api/user/:userId', userController.update)
router.delete('/api/user/:userId', userController.delete)

router.use(notFound)
module.exports = router
