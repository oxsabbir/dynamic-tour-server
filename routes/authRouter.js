const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.uploadSingle, authController.signUp);
router.post("/login", authController.login);

router.post(
  "/updateMe",
  authController.routeProtect,
  authController.uploadSingle,
  authController.updateProfile
);

router.get("/getMe", authController.routeProtect, authController.getMe);

module.exports = router;
