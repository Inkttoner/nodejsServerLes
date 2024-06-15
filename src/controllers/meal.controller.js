
import logger from '../util/logger'
import mealService from '../services/meal.service'

let mealController = {
    getAll: (req, res, next) => {
        logger.trace('getAll meals called')
        mealService.getAll((error, success) => {
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
    create: (req, res, next) => {
        const userId = req.userId
        logger.trace('create meal called')
        mealService.create(req.body, userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(201).json({
                    status: 201,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },
    getById: (req, res, next) => {
        const mealId = req.params.mealId
        logger.trace('getById meal called')
        mealService.getById(mealId, (error, success) => {
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
    delete: (req, res, next) => {
        const mealId = req.params.mealId
        const userId = req.userId
    
        logger.trace('delete meal called', mealId)
    
        mealService.getById(mealId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
    
            if (success) {
                const meal = success.data[0]
                logger.info('delete meal', mealId, userId, meal.cookId)
                if (userId !== meal.cookId) {
                    return next({
                        status: 403,
                        message: "You are not authorized to delete this meal",
                        data: {}
                    })
                }
    
                mealService.delete(mealId, (error, success) => {
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
        })
    }
}
module.exports = mealController