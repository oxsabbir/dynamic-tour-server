const express = require("express");
const statsController = require("../controllers/statsController");
const authController = require("../controllers/authController");

const router = express.Router();
router.use(authController.routeProtect, authController.authorise("admin"));

router.get("/sales", statsController.getSalesStats);
router.get("/loyaleGuides", statsController.getLoyaleGuides);
router.get("/salesOverview", statsController.getSalesOverView);
router.get("/userJoinStats", statsController.getUserJoinStats);

module.exports = router;
