const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");


router.get("/production-data", dashboardController.getProductionDashboard);
router.get("/safety-data", dashboardController.getSafetyDashboardData);



router.get("/production", dashboardController.getProductionDashboardPage);
router.get("/safety", dashboardController.getSafetyDashboardPage);

module.exports = router;
