const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();
router
  .route("/")
  .post(userController.createUser)
  .get(userController.getAllUser);

module.exports = router;
