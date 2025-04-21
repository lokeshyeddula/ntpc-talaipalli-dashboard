const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");


router.get("/production-data", dashboardController.getProductionDashboard);




router.get("/production", dashboardController.getProductionDashboardPage);

module.exports = router;
