const express = require("express");
const authController = require("../controllers/authController");
const guideController = require("../controllers/guideController");
const router = express.Router();

router.route("/").get(guideController.getAllGuide);

router.post(
  "/becomeGuide",
  authController.routeProtect,
  guideController.becomeGuide
);

router.get(
  "/pending",
  authController.routeProtect,
  authController.authorise("admin"),
  guideController.getPendingGuide
);

router.get(
  "/accept/:id",
  authController.routeProtect,
  authController.authorise("admin"),
  guideController.acceptGuide
);
router.get(
  "/reject/:id",
  authController.routeProtect,
  authController.authorise("admin"),
  guideController.rejectGuide
);

router
  .route("/:id")
  .get(guideController.getGuide)
  .delete(
    authController.routeProtect,
    authController.authorise("admin"),
    guideController.deleteGuide
  );

module.exports = router;
