//
// Authentication routes
import dotenv from 'dotenv'
import assert from 'assert'
import jwt from 'jsonwebtoken'
import AuthController from '../controllers/authentication.controller.js'
import logger from '../util/logger.js'
import express from 'express'

const routes = express.Router()

const jwtSecretKey = process.env.JWT_SECRET_KEY
//
//
//
export function validateLogin(req, res, next) {
    // Verify that we receive the expected input
    try {
        assert(req.body.emailAdress, 'Missing or incorrect emailAdress field')
        assert(req.body.password, 'Missing or incorrect password field')
        next()
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

//
//
//
export function showLog(req, res, next) {
    logger.info('Log message')
    next()
}
export function validateToken(req, res, next) {
    logger.info('validateToken called')
    logger.trace('Headers:', req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization
    if (!authHeader) {
        logger.warn('Authorization header missing!')
        next({
            status: 401,
            message: 'Authorization header missing!',
            data: {}
        })
    } else {
        // Strip the word 'Bearer ' from the headervalue
        const token = authHeader.substring(7, authHeader.length)

        jwt.verify(token, jwtSecretKey, (err, payload) => {
            if (err) {
                logger.warn('Not authorized')
                next({
                    status: 401,
                    message: 'Not authorized!',
                    data: {}
                })
            }
            if (payload) {
                logger.debug('token is valid', payload)
                /**
                 * User heeft toegang.
                 * BELANGRIJK! Voeg UserId uit payload toe aan request,
                 * zodat die voor ieder volgend endpoint beschikbaar is.
                 * Je hebt dan altijd toegang tot de userId van de ingelogde gebruiker.
                 */
                req.userId = payload.userId
                next()
            }
        })
    }
}

routes.post('/login', validateLogin, AuthController.login)

export default routes
