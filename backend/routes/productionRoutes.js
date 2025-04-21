const express = require("express");
const router = express.Router();
const productionController = require("../controllers/productionController");

router.get("/", productionController.getProductionPage);
router.post("/", productionController.addProductionEntry);
router.get("/fetch", productionController.getProductionData);

module.exports = router;
