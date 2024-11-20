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

router.get(
  "/pending",
  authController.routeProtect,
  authController.authorise,
  guideController.getPendingGuide
);

router.post(
  "/accept/:id",
  authController.routeProtect,
  authController.authorise,
  guideController.acceptGuide
);
router.post(
  "/reject/:id",
  authController.routeProtect,
  authController.authorise,
  guideController.rejectGuide
);

module.exports = router;
