import express from 'express';
import assert from 'assert';
import {should, assert, expect} from 'chai';
chai.should();

const router = express.Router();

import mealController from '../controllers/meal.controller.js';
import logger from '../util/logger.js';
import { validateToken } from './authentication.routes.js';

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


export default router;