const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const mealController = require('../controllers/meal.controller')
const logger = require('../util/logger')
const validateToken = require('./authentication.routes').validateToken

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
const validateUser = (req, res, next) => {
    try {
        assert(req.body.firstName, 'Missing or incorrect firstName field');
        expect(req.body.firstName).to.not.be.empty;
        expect(req.body.firstName).to.be.a('string');
        expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/,
            'firstName must be a string'
        );

        assert(req.body.lastName, 'Missing or incorrect lastName field');
        expect(req.body.lastName).to.not.be.empty;
        expect(req.body.lastName).to.be.a('string');
        expect(req.body.lastName).to.match(
            /^[a-zA-Z]+$/,
            'lastName must be a string'
        );

        assert(req.body.emailAdress, 'Missing or incorrect emailAdress field');
        expect(req.body.emailAdress).to.not.be.empty;
        expect(req.body.emailAdress).to.be.a('string');
        expect(req.body.emailAdress).to.match(
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'emailAdress must be a correct email'
        );

        assert(req.body.isActive, 'Missing or incorrect isActive field');
        expect(req.body.isActive).to.not.be.undefined;
        expect(req.body.isActive).to.be.a('number');
        expect(req.body.isActive).to.match(
            /^[01]$/,
            'isActive must be a correct email'
        );

        assert(req.body.password, 'Missing or incorrect password field');
        expect(req.body.password).to.not.be.empty;
        expect(req.body.password).to.be.a('string');
        expect(req.body.password).to.have.lengthOf.above(3);

        assert(req.body.phoneNumber, 'Missing or incorrect phone number field');
        expect(req.body.phoneNumber).to.not.be.empty;
        expect(req.body.phoneNumber).to.be.a('string');
        expect(req.body.phoneNumber).to.match(
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
            'phone number must be a correct phone number'
        );

        assert(req.body.roles, 'Missing or incorrect roles field');
        expect(req.body.roles).to.not.be.empty;
        expect(req.body.roles).to.be.a('string');

        next();
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        res.status(400).send({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}

const validateUserId = (req, res, next) => {
    try {
        assert(req.params.userId, 'Missing or incorrect id!');
        expect(req.params.userId).to.not.be.empty;
        expect(parseInt(req.params.userId)).to.be.a('number');
        logger.trace('User successfully validated');
        next();
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        res.status(400).send({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}

const validateLogin = (req, res, next) => {
    try {
        assert(req.body.emailAdress, 'Missing or incorrect emailAdress field');
        expect(req.body.emailAdress).to.not.be.empty;
        expect(req.body.emailAdress).to.be.a('string');
        expect(req.body.emailAdress).to.match(
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'emailAdress must be a correct email'
        );

        assert(req.body.password, 'Missing or incorrect password field');
        expect(req.body.password).to.not.be.empty;
        expect(req.body.password).to.be.a('string');
        expect(req.body.password).to.have.lengthOf.above(3);

        next();
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        res.status(400).send({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}
router.get('/api/user', validateToken, userController.getAll)
router.get('/api/user/profile', validateToken, userController.getProfile)
router.get('/api/user/:userId', validateToken, validateUserId, userController.getById)
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

router.put('/api/user/:userId', validateToken, validateUser, validateUserId, userController.update)
router.delete('/api/user/:userId', validateToken, validateUserId, userController.delete)


// meal routes
router.get('/api/meal', mealController.getAll)
router.post('/api/meal', validateToken, mealController.create)
router.get('/api/meal/:mealId', mealController.getById)
router.delete('/api/meal/:mealId', validateToken, mealController.delete)
router.use(notFound)
module.exports = router
