const e = require('express')
const userService = require('../services/user.service')
const logger = require('../util/logger')

let userController = {
    create: (req, res, next) => {
        const user = req.body
        logger.info('create user', user.firstName, user.lastName)
        userService.create(user, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(201).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    getAll: (req, res, next) => {
        logger.trace('getAll')
        const filters = req.query;
        const filterKeys = Object.keys(filters);
    
        if (filterKeys.length > 2) {
            return next({
                status: 400,
                message: 'You can specify a maximum of 2 filters.',
                data: {}
            });
        }
    
        userService.getAll(filters, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    update: (req, res, next) => {
        const userId = req.params.userId
        const loggedInUser = req.userId
        const newData = req.body
    
        logger.info('update user', userId, loggedInUser, newData)
    
        // Check if the requested userId matches the logged-in userId
        if (userId != loggedInUser) {
            return res.status(403).json({
                status: 403,
                message: 'Unauthorized',
                data: {}
            })
        }
    
        // Retrieve user by userId
        userService.getById(userId, (error, user) => {
            if (error) {
                return res.status(500).json({
                    status: 500,
                    message: 'Internal Server Error',
                    data: {}
                })
            }
    
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found',
                    data: {}
                })
            }
    
            // User exists, proceed with the update
            userService.changeUser(userId, newData, (error, success) => {
                if (error) {
                    return res.status(500).json({
                        status: error.status,
                        message: error.message,
                        data: {}
                    })
                }
    
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            })
        })
    },
    
    delete: (req, res, next) => {
        const userId = req.params.userId
        const loggedInUser = req.userId
    
        logger.info('delete user', userId, loggedInUser)
    
        // Check if the requested userId matches the logged-in userId
        if (userId != loggedInUser) {
            return res.status(401).json({
                status: 401,
                message: 'Unauthorized',
                data: {}
            })
        }
    
            userService.deleteUser(userId, (error, success) => {
                if (error) {
                    return res.status(500).json({
                        status: 500,
                        message: 'Internal Server Error',
                        data: {}
                    })
                }
    
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            })   
    },
    
    getById: (req, res, next) => {
        const userId = req.params.userId
        logger.trace('userController: getById', userId)
        userService.getById(userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                if (success.data.length === 0) {
                    res.status(404).json({
                        status: 404,
                        message: `No user found with id ${userId}.`,
                        data: {}
                    })
                } else {
                    res.status(200).json({
                        status: success.status,
                        message: success.message,
                        data: success.data
                    })
                }
            }
        })
    },
    getProfile: (req, res, next) => {
        const userId = req.userId
        logger.trace('getProfile for userId', userId)
        userService.getProfile(userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                })
            }
        })
    }
}

module.exports = userController
