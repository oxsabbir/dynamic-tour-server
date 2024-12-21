const express = require("express");
const statsController = require("../controllers/statsController");

const router = express.Router();

router.get("/sales", statsController.getSalesStats);

module.exports = router;
