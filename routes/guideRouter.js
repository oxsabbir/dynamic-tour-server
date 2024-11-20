const express = require("express");
const authController = require("../controllers/authController");
const guideController = require("../controllers/guideController");
const router = express.Router();

router.route("/").get(authController.routeProtect, guideController.getGuides);
router.get(
  "/becomeGuide",
  authController.routeProtect,
  guideController.becomeGuide
);

module.exports = router;
