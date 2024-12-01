const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const guideController = require("../controllers/guideController");
const router = express.Router();

router
  .route("/")
  .get(
    authController.routeProtect,
    authController.authorise("admin"),
    userController.getAllUser
  );
router.route("/username/:userName").get(userController.getUserByUserName);

router
  .route("/:userId")
  .get(authController.routeProtect, userController.getUser);

module.exports = router;
