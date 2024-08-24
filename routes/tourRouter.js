const express = require("express");
const router = express.Router();

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.routeProtect,
    authController.authorise("admin"),
    tourController.uploadFields,
    tourController.addTour
  );

router
  .route("/:tourId")
  .get(tourController.getTour)
  .patch(
    authController.routeProtect,
    authController.authorise("admin"),
    tourController.uploadFields,
    tourController.updateTour
  )
  .delete(
    authController.routeProtect,
    authController.authorise("admin"),
    tourController.deleteTour
  );

module.exports = router;
