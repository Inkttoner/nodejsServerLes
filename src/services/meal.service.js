import logger from "../util/logger.js";
import db from "../dao/mysql-db.js";
import query from "../dao/mysql-db.js";

const mealService = {
    create: async (meal, userID, callback) => {
        logger.info(`create meal with name ${meal.name} `);
        const thisDate = new Date();
        const formattedDate = `${thisDate.toJSON().split("T")[0]} ${
            thisDate.toJSON().split("T")[1].split(".")[0]
        }`;
        try {
            const createdMeal = await query(
                "INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageURL, cookId, createDate, updateDate, name, description, allergenes)" +
                    `VALUES (${meal.isActive}, ${meal.isVega}, ${meal.isVegan}, ${meal.isToTakeHome}, '${meal.dateTime}', ${meal.maxAmountOfParticipants}, ${meal.price}, '${meal.imageURL}', ${userID}, '${formattedDate}', '${formattedDate}', '${meal.name}', '${meal.description}', '${meal.allergenes}')`
            );

            logger.info(`meal created with id ${createdMeal.insertId}`);
            callback(null, {
                status: 200,
                message: `meal created with id ${createdMeal.insertId}`,
                data: meal,
            });
        } catch (error) {
            logger.error(`error creating meal:`, error.message);
            callback(error, null);
        }
    },
    getAll: async (callback) => {
        logger.info("getAll");
        try {
            const meals = await query("SELECT * FROM meal");
            for (let i = 0; i < meals.length; i++) {
                const userCook = await query(
                    `SELECT firstName, lastName, isActive, emailAdress, phoneNumber, street, city FROM user WHERE id = ${meals[i].cookId}`
                );
                meals[i].cook = userCook[0];
                const participants = await query(
                    `SELECT firstName, lastName, isActive, emailAdress, phoneNumber, street, city FROM user WHERE id in (SELECT userId FROM meal_participants_user where mealId = ${meals[i].id}) `
                );
                meals[i].participants = participants;
            }
            callback(null, {
                status: 200,
                message: `Found ${meals.length} meals.`,
                data: meals,
            });
        } catch (error) {
            logger.error(error);
            callback(error, null);
        }
    },
    getById: async (mealId, callback) => {
        logger.info("getById", mealId);
        try {
            const meals = await query(
                `SELECT * FROM meal WHERE id = ${mealId}`
            );
            if (!meals || meals.length < 1) {
                throw {
                    status: 404,
                    message: `Meal with id: ${mealId} not found!`,
                    data: {},
                };
            }
            const userCook = await query(
                `SELECT firstName, lastName, isActive, emailAdress, phoneNumber, street, city FROM user WHERE id = ${meals[0].cookId}`
            );
            meals[0].cook = userCook[0];
            const participants = await query(
                `SELECT firstName, lastName, isActive, emailAdress, phoneNumber, street, city FROM user WHERE id in (SELECT userId FROM meal_participants_user where mealId = ${meals[0].id}) `
            );
            meals[0].participants = participants;
            callback(null, {
                status: 200,
                message: `Found meal with id: ${mealId}.`,
                data: meals[0],
            });
        } catch (error) {
            logger.error(error);
            callback(error, null);
        }
    },
    delete: async (mealId, userId, callback) => {
        logger.info("delete meal", mealId);
        try {
            const meal = await query(`SELECT * FROM meal WHERE id = ${mealId}`);
            if (!meal || meal.length === 0) {
                throw {
                    status: 404,
                    message: `Meal with id: ${mealId} not found!`,
                    data: {},
                };
            }
            if (meal[0].cookId != userId) {
                throw {
                    status: 403,
                    message: "Not authorized to delete this meal!",
                    data: {},
                };
            }
            await query(`DELETE FROM meal WHERE id = ${mealId}`);
            callback(null, {
                status: 200,
                message: `Meal deleted with id ${mealId}.`,
                data: {},
            });
        } catch (error) {
            logger.error(error);
            callback(error, null);
        }
    },
    update: async (mealId, meal, userId, callback) => {
        logger.info(`update meal with id ${mealId}`);
        const thisDate = new Date();
        const formattedDate = `${thisDate.toJSON().split("T")[0]} ${
            thisDate.toJSON().split("T")[1].split(".")[0]
        }`;
        try {
            const oldMeal = await query(
                `SELECT * FROM meal WHERE id = ${mealId}`
            );

            if (!oldMeal || oldMeal.length < 1) {
                throw {
                    status: 404,
                    message: `Meal with id: ${mealId} not found!`,
                    data: {},
                };
            }
            if (oldMeal[0].cookId != userId) {
                throw {
                    status: 403,
                    message: "Not authorized to update this meal!",
                    data: {},
                };
            }
            await query(
                `UPDATE meal SET isActive = ${meal.isActive}, isVega = ${meal.isVega}, isVegan = ${meal.isVegan}, isToTakeHome = ${meal.isToTakeHome}, dateTime = '${meal.dateTime}', maxAmountOfParticipants = ${meal.maxAmountOfParticipants}, price = ${meal.price}, imageURL = '${meal.imageURL}', cookId = ${userId}, createDate = '${meal.createDate}', updateDate = '${formattedDate}', name = '${meal.name}', description = '${meal.description}', allergenes = '${meal.allergenes}' WHERE id = ${mealId};`
            );
            callback(null, {
                status: 201,
                message: `meal updated with id: ${mealId}`,
                data: meal,
            });
        } catch (error) {
            logger.error(error);
            callback(error, null);
        }
    },
};

export default mealService;
