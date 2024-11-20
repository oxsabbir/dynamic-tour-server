const express = require("express");
const authController = require("../controllers/authController");
const guideController = require("../controllers/guideController");
const router = express.Router();

router.route("/").get(authController.routeProtect, guideController.getGuides);

module.exports = router;
