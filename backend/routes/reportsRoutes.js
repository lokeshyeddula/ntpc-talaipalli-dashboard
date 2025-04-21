const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");

router.get("/reports-data", reportsController.getReport);

router.get("/", reportsController.getProductionPage);

module.exports = router;
