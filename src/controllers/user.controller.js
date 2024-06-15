const e = require("express");
const userService = require("../services/user.service");
const logger = require("../util/logger");

let userController = {
    create: (req, res, next) => {
        const user = req.body;
        logger.info("create user", user.firstName, user.lastName);
        userService.create(user, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {},
                });
            }
            if (success) {
                res.status(201).json({
                    status: success.status,
                    message: success.message,
                    data: success.data,
                });
            }
        });
    },

    getAll: (req, res, next) => {
        logger.trace("getAll");
        const filters = req.query;
        const filterKeys = Object.keys(filters);

        if (filterKeys.length > 2) {
            return next({
                status: 400,
                message: "You can specify a maximum of 2 filters.",
                data: {},
            });
        }
        userService.getAll((error, success) => {
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
                    data: success.data,
                });
            }
        });
    },

    update: (req, res, next) => {
        const userId = req.locals.userId;
        const newData = req.body;

        logger.info("update user", userId, newData);

        userService.changeUser(
            userId,
            parseInt(req.params.userId),
            newData,
            (error, success) => {
                if (error) {
                    next({
                        status: error.status,
                        message: error.message,
                        data: {},
                    });
                }
                if (success) {
                    res.status(200).json({
                        status: success.status,
                        message: success.message,
                        data: success.data,
                    });
                }
            }
        );
    },

    delete: (req, res, next) => {
        const userId = req.locals.userId;
        logger.info("delete user", userId, loggedInUser);
        userService.deleteUser(
            userId,
            parseInt(req.params.userId),
            (error, success) => {
                if (error) {
                    next({
                        status: 500,
                        message: "Internal Server Error",
                        data: {},
                    });
                }
                if (success) {
                    res.status(200).json({
                        status: success.status,
                        message: success.message,
                        data: success.data,
                    });
                }
            }
        );
    },

    getById: (req, res, next) => {
        const userId = parseInt(req.params.userId);
        let withPassword = false;
        if (req.locals.userId === userId) {
            withPassword = true;
        }
        logger.trace("userController: getById", userId);
        userService.getById(userId, withPassword, (error, success) => {
            if (error) {
                next({
                    status: error.status,
                    message: error.message,
                    data: {},
                });
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data,
                });
            }
        });
    },
    getProfile: (req, res, next) => {
        logger.trace("getProfile for userId", userId);
        userService.getProfile(req.locals.userId, (error, success) => {
            if (error) {
                next({
                    status: error.status,
                    message: error.message,
                    data: {},
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data,
                });
            }
        });
    },
    login: (req, res, next) => {
        logger.info("UserController: login");
        userService.login(req.body, (error, success) => {
            if (error) {
                next({
                    status: error.status,
                    message: error.message,
                    data: {},
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data,
                });
            }
        });
    },
};

module.exports = userController;
