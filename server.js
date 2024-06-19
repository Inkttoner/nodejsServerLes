import express from "express";
import logger from "./src/util/logger.js";
import userRoutes from "./src/routes/user.routes.js";
import mealRouter from "./src/routes/meal.routes.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: 200,
        message: "Welcome to the meal API",
        data: {},
    });
});

app.get("/api/info", (req, res) => {
    res.json({
        status: 200,
        message: "System info",
        data: {
            studentName: "Coen de Kruijf",
            studentNumber: 2220822,
            description: "Laatste opdracht voor programmeren 4 kans 2",
        },
    });
});

app.use(userRoutes);
app.use(mealRouter);

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Internal Server Error",
        data: {},
    });
});

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

export default app;
