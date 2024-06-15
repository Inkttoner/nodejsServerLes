import logger from '../util/logger'
import db from '../dao/mysql-db'

const mealService = {
    create: (meal, userID, callback) => {
        logger.info('create meal', meal, userID)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }
                connection.query(
                    'INSERT INTO `meal` (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, allergenes, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        meal.name,
                        meal.description,
                        meal.isActive,
                        meal.isVega,
                        meal.isVegan,
                        meal.isToTakeHome,
                        meal.dateTime,
                        meal.maxAmountOfParticipants,
                        meal.price,
                        meal.imageUrl,
                        meal.allergenes,
                        userID
                    ],
                    function (error, results, fields) {
                        connection.release()
                        if (error) {
                            return connection.rollback(function () {
                                logger.error(error)
                                callback(error, null)
                            })
                        }else{
                            logger.debug(results)
                            callback(null, {
                                message: `Meal created with id ${results.insertId}.`,
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
                `SELECT meal.id, meal.name, meal.description, meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, meal.allergenes, 
                    cook.firstname AS cook_firstname, cook.lastname AS cook_lastname, cook.emailAdress AS cook_emailAdress, cook.phoneNumber AS cook_phoneNumber,
    participant.firstname AS participant_firstname, participant.lastname AS participant_lastname
    FROM meal
    INNER JOIN user AS cook ON meal.cookId = cook.id
    LEFT JOIN meal_participants_user ON meal.id = meal_participants_user.mealID
    LEFT JOIN user AS participant ON meal_participants_user.userID = participant.id`,
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        const meals = {};

                        results.forEach(result => {
                            if (!meals[result.id]) {
                                meals[result.id] = {
                                    id: result.id,
                                    name: result.name,
                                    description: result.description,
                                    // ... other meal properties
                                    cook: {
                                        firstname: result.cook_firstname,
                                        lastname: result.cook_lastname,
                                        emailAdress: result.cook_emailAdress,
                                        phoneNumber: result.cook_phoneNumber
                                    },
                                    participants: []
                                };
                            }
                        
                            if (result.participant_firstname && result.participant_lastname) {
                                meals[result.id].participants.push({
                                    firstname: result.participant_firstname,
                                    lastname: result.participant_lastname
                                });
                            }
                        });
                        
                        const mappedResults = Object.values(meals);

                        logger.debug(mappedResults)
                        callback(null, {
                            message: `Found ${mappedResults.length} meals.`,
                            data: mappedResults
                        })
                    }
                }
            )
        })
    },
    getById: (mealId, callback) => {
        logger.info('getById', mealId)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                `SELECT meal.id, meal.cookId, meal.name, meal.description, meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, meal.allergenes, 
                cook.firstname AS cook_firstname, cook.lastname AS cook_lastname, cook.emailAdress AS cook_emailAdress, cook.phoneNumber AS cook_phoneNumber,
participant.firstname AS participant_firstname, participant.lastname AS participant_lastname, participant.emailAdress AS participant_emailAdress, participant.phoneNumber AS participant_phoneNumber
FROM meal
INNER JOIN user AS cook ON meal.cookId = cook.id
LEFT JOIN meal_participants_user ON meal.id = meal_participants_user.mealID
LEFT JOIN user AS participant ON meal_participants_user.userID = participant.id
                    WHERE meal.id = ?`,
                [mealId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else if (results.length === 0) {
                        callback(
                            {
                                status: 404,
                                message: `Meal with id ${mealId} not found.`,
                                data: {}
                            },
                            null
                        )
                    } else {
                        const meals = {};

                        results.forEach(result => {
                            if (!meals[result.id]) {
                                meals[result.id] = {
                                    id: result.id,
                                    name: result.name,
                                    description: result.description,
                                    isActive: result.isActive,
                                    isVega: result.isVega,
                                    isVegan: result.isVegan,
                                    isToTakeHome: result.isToTakeHome,
                                    dateTime: result.dateTime,
                                    maxAmountOfParticipants: result.maxAmountOfParticipants,
                                    price: result.price,
                                    imageUrl: result.imageUrl,
                                    allergenes: result.allergenes,
                                    cookId: result.cookId,
                                    cook: {
                                        firstname: result.cook_firstname,
                                        lastname: result.cook_lastname,
                                        emailAdress: result.cook_emailAdress,
                                        phoneNumber: result.cook_phoneNumber
                                    },
                                    participants: []
                                };
                            }
                        
                            if (result.participant_firstname && result.participant_lastname) {
                                meals[result.id].participants.push({
                                    firstname: result.participant_firstname,
                                    lastname: result.participant_lastname,
                                    emailAdress: result.participant_emailAdress,
                                    phoneNumber: result.participant_phoneNumber
                                });
                            }
                        });
                        
                        const mappedResults = Object.values(meals);

                        logger.debug(mappedResults)
                        callback(null, {
                            message: `Found meal with id ${mealId}.`,
                            data: mappedResults
                        })
                    }
                }
            )
        })
    },
    delete: (mealId, callback) => {
        
        logger.info('delete meal', mealId)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }
            //check if meal exists
            connection.query(
                'SELECT * FROM `meal` WHERE id = ?',
                [mealId],
                function (error, results, fields) {
                    if (error) {
                        logger.error(error)
                        callback(error, null)
                        
                    }else if (results.length === 0) {
                        connection.release()
                        callback(
                            {
                                status: 404,
                                message: `Meal with id ${mealId} not found.`,
                                data: {}
                            },
                            null
                        )
                        
                    }else{
                        connection.query(
                            'DELETE FROM `meal` WHERE id = ?',
                            [mealId],
                            function (error, results, fields) {
                                connection.release()
        
                                if (error) {
                                    return connection.rollback(function () {
                                        logger.error(error)
                                        callback(error, null)
                                    })
                                }
        
                                logger.debug(results)
                                callback(null, {
                                    message: `Meal with id ${mealId} deleted.`,
                                    data: results
                                })
                            }
                        )
                    }
                }
            )   
        })
    }
}

export default mealService
