const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(
    authController.routeProtect,
    authController.authorise("admin"),
    userController.getAllUser
  );

router
  .route("/:userId")
  .get(authController.routeProtect, userController.getUser);

module.exports = router;
