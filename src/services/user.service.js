const database = require('../dao/inmem-db')
const logger = require('../util/logger')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)
        database.add(user, (err, data) => {
            if (err) {
                logger.info(
                    'error creating user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                logger.trace(`User created with id ${data.id}.`)
                callback(null, {
                    message: `User created with id ${data.id}.`,
                    data: data
                })
            }
        })
    },

    getAll: (callback) => {
        logger.info('getAll')
        database.getAll((err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `Found ${data.length} users.`,
                    data: data
                })
            }
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
    searchUser: (id, callback) => {
        logger.info('searchUser', id)
        database.getById(id, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `User with id ${id} found.`,
                    data: data
                })
            }
        })
    }
}

module.exports = userService
