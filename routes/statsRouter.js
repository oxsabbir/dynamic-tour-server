const express = require("express");
const statsController = require("../controllers/statsController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get(
  "/sales",
  authController.routeProtect,
  authController.authorise,
  statsController.getSalesStats
);
router.get(
  "/loyaleGuides",
  authController.routeProtect,
  statsController.getLoyaleGuides
);

module.exports = router;
