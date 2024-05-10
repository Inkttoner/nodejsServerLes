const database = require('../dao/inmem-db')
const logger = require('../util/logger')
const db = require('../dao/mysql-db')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)
        // database.add(user, (err, data) => {
        //     if (err) {
        //         logger.info(
        //             'error creating user: ',
        //             err.message || 'unknown error'
        //         )
        //         callback(err, null)
        //     } else {
        //         logger.trace(`User created with id ${data.id}.`)
        //         callback(null, {
        //             message: `User created with id ${data.id}.`,
        //             data: data
        //         })
        //     }
        // })
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'INSERT INTO `user` (firstName, lastName, emailAdress, password) VALUES (?, ?, ?, ?)',
                [user.firstName, user.lastName, user.emailAdress, user.password],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `User created with id ${results.insertId}.`,
                            data: results
                        })
                    }
                }
            )
        })
    },

    getAll: (callback) => {
        logger.info('getAll')
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName, emailAdress, password FROM `user`',
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} users.`,
                            data: results
                        })
                    }
                }
            )
        })
    },
    changeUser: (id, newData, callback) => {
        logger.info('changeUser', id, newData)
        database.update(id, newData, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `User with id ${id} updated.`,
                    data: data
                })
            }
        })
    },
    deleteUser: (id, callback) => {
        logger.info('deleteUser', id)
        database.delete(id, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `User with id ${id} deleted.`,
                    data: data
                })
            }
        })
    },
    // searchUser: (userId, callback) => {
    //     logger.info('getProfile userId:', userId)

    //     db.getConnection(function (err, connection) {
    //         if (err) {
    //             logger.error(err)
    //             callback(err, null)
    //             return
    //         }

    //         connection.query(
    //             'SELECT id, firstName, lastName FROM `user` WHERE id = ?',
    //             [userId],
    //             function (error, results, fields) {
    //                 connection.release()

    //                 if (error) {
    //                     logger.error(error)
    //                     callback(error, null)
    //                 } else {
    //                     logger.debug(results)
    //                     callback(null, {
    //                         message: `Found ${results.length} user.`,
    //                         data: results
    //                     })
    //                 }
    //             }
    //         )
    //     })
    // },
    getProfile: (userId, callback) => {
        logger.info('getProfile userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} user.`,
                            data: results
                        })
                    }
                }
            )
        })
    }
}

module.exports = userService
