const express = require("express");
const statsController = require("../controllers/statsController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get(
  "/sales",
  authController.routeProtect,
  authController.authorise("admin"),
  statsController.getSalesStats
);
router.get(
  "/loyaleGuides",
  authController.routeProtect,
  authController.authorise("admin"),
  statsController.getLoyaleGuides
);

module.exports = router;
