import logger from "../util/logger.js";
import mealService from "../services/meal.service.js";

let mealController = {
    getAll: (req, res, next) => {
        logger.trace("getAll meals called");
        mealService.getAll((error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {},
                });
            }
            if (success) {
                res.status(200).json({
                    ...success,
                });
            }
        });
    },
    create: (req, res, next) => {
        logger.trace("create meal called");
        mealService.create(req.body, res.locals.userId, (error, success) => {
            if (error) {
                return next({
                    status: 403,
                    message: error.message,
                    data: {},
                });
            }
            if (success) {
                res.status(201).json({ ...success });
            }
        });
    },
    getById: (req, res, next) => {
        logger.trace("getById meal called");
        mealService.getById(req.params.mealId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {},
                });
            }
            if (success) {
                res.status(200).json({
                    ...success,
                });
            }
        });
    },
    delete: (req, res, next) => {
        const mealId = parseInt(req.params.mealId);

        logger.trace("delete meal called", mealId);

        mealService.delete(mealId, res.locals.userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {},
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                });
            }
        });
    },
    update: (req, res, next) => {
        const mealId = parseInt(req.params.mealId);
        logger.trace("update meal called");
        mealService.update(
            mealId,
            req.body,
            res.locals.userId,
            (error, success) => {
                if (error) {
                    return next({
                        status: error.status,
                        message: error.message,
                        data: {},
                    });
                }
                if (success) {
                    res.status(201).json({
                        ...success,
                    });
                }
            }
        );
    },
};
export default mealController;
