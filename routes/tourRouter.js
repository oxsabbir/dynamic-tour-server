const express = require("express");
const router = express.Router();

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(tourController.getAllTours)
  .post(authController.authorise("admin"), tourController.addTour);

router
  .route("/:tourId")
  .get(tourController.getTour)
  .put(authController.authorise("admin"), tourController.updateTour)
  .delete(authController.authorise("admin"), tourController.deleteTour);

module.exports = router;
