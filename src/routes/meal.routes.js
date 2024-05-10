const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const logger = require('../util/logger')
const database = require('../dao/inmem-db')
const validateToken = require('./authentication.routes').validateToken

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

//meal routes
router.get('/api/meal', mealController.getAll)


module.exports = router