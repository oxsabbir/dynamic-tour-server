const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.route("/").get(userController.getAllUser);
router.post("/:userName", userController.updateProfile);

module.exports = router;
