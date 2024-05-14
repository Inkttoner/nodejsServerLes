const database = require('../dao/inmem-db')
const logger = require('../util/logger')
const db = require('../dao/mysql-db')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'INSERT INTO `user` (firstName, lastName, emailAdress, password, street, city, isActive, phoneNumber ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    user.firstName,
                    user.lastName,
                    user.emailAdress,
                    user.password,
                    user.street,
                    user.city,
                    true,
                    user.phoneNumber
                ],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        if (error.code === 'ER_DUP_ENTRY') {
                            callback(
                                {
                                    status: 403,
                                    message:
                                        'Email already exists in the database',
                                    data: {}
                                },
                                null
                            )
                        } else {
                            callback(error, null)
                        }
                    } else {
                        logger.debug(results)
                        const newUser = {
                        id: results.insertId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        emailAdress: user.emailAdress,
                        password: user.password,
                        street: user.street,
                        city: user.city,
                        isActive: true,
                        phoneNumber: user.phoneNumber
                        }
                        callback(null, {
                            status: 201,
                            message: `User created with id ${results.insertId}.`,
                            data: [newUser]
                        })
                    }
                }
            )
        })
    },
    getAll: (filters, callback) => {
        logger.info('getAll')
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }
    
            let query = 'SELECT id, firstName, lastName, emailAdress, phoneNumber FROM `user`';
            let params = [];
    
            if (filters) {
                let isFirst = true;
                for (let key in filters) {
                    if (filters.hasOwnProperty(key)) {
                        query += isFirst ? ' WHERE' : ' AND';
                        query += ` ${key} = ?`;
                        params.push(filters[key]);
                        isFirst = false;
                    }
                }
            }
    
            connection.query(query, params, function (error, results, fields) {
                connection.release()
    
                if (error) {
                    logger.error(error)
                    callback(error, null)
                } else {
                    logger.debug(results)
                    callback(null, {
                        status: 200,
                        message: `Found ${results.length} users.`,
                        data: results
                    })
                }
            })
        })
    },
    changeUser: (id, newData, callback) => {
        logger.info('changeUser', id, newData)
        // database.update(id, newData, (err, data) => {
        //     if (err) {
        //         callback(err, null)
        //     } else {
        //         callback(null, {
        //             message: `User with id ${id} updated.`,
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
                'SELECT * FROM `user` WHERE id = ?',
                [id],
                function (error, results, fields) {
                    logger.debug('SELECT QUERY', id)
                    if (error) {
                        logger.error('Error in SELECT QUERY', error)
                        connection.release()
                        callback(error, null)
                    } else if (results.length === 0) {
                        callback(null, {
                            status: 404,
                            message: `User not found.`,
                            data: results
                        })
                        logger.debug('User not found')
                        connection.release()
                    } else {
                        // If the user exists, update it
                        connection.query(
                            'UPDATE `user` SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, street = ?, city = ?, isActive = ?, phoneNumber = ? WHERE id = ?',
                            [
                                newData.firstName,
                                newData.lastName,
                                newData.emailAdress,
                                newData.password,
                                newData.street,
                                newData.city,
                                newData.isActive,
                                newData.phoneNumber,
                                id
                            ],
                            function (error, results, fields) {
                                connection.release()

                                if (error) {
                                    logger.error(error)
                                    callback(error, null)
                                } else {
                                    logger.debug(results)
                                    callback(null, {
                                        message: `User with id ${id} updated.`,
                                        data: results
                                    })
                                }
                            }
                        )
                    }
                }
            )
        })
    },
    deleteUser: (id, callback) => {
        logger.info('deleteUser', id)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            // First, check if the user exists
            connection.query(
                'SELECT * FROM `user` WHERE id = ?',
                [id],
                function (error, results, fields) {
                    logger.debug('SELECT QUERY', id)
                    if (error) {
                        logger.error('Error in SELECT QUERY', error)
                        connection.release()
                        callback(error, null)
                    } else if (results.length === 0) {
                        callback(null, {
                            status: 404,
                            message: `User not found.`,
                            data: results
                        })
                        logger.debug('User not found')
                        connection.release()
                    } else {
                        // If the user exists, delete it
                        connection.query(
                            'DELETE FROM `user` WHERE id = ?',
                            [id],
                            function (error, results, fields) {
                                connection.release()

                                if (error) {
                                    logger.error('Error in DELETE QUERY', error)
                                    callback(error, null)
                                } else {
                                    logger.debug(results)
                                    callback(null, {
                                        message: `User with id ${id} deleted.`,
                                        data: results
                                    })
                                }
                            }
                        )
                    }
                }
            )
        })
    },
    getProfile: (userId, callback) => {
        logger.info('getProfile userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName, emailAdress, password, emailAdress, phoneNumber, isActive FROM `user` WHERE id = ?',
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
    },
    getById: (userId, callback) => {
        logger.info('getById used userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName, emailAdress, phoneNumber, isActive, city, street  FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else if (results.length === 0) {
                        logger.debug(results)
                        callback(null, {
                            message: `no user found with id ${userId}.`
                        })
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
