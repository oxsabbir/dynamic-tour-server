const express = require("express");
const router = express.Router();

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("../routes/reviewRouter");
const reviewController = require("../controllers/reviewController");

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.routeProtect,
    authController.authorise("admin"),
    tourController.uploadFields,
    tourController.addAndUpdateTour("add")
  );

router.use("/:tourId/review", reviewRouter);

router
  .route("/:tourId")
  .get(tourController.getTour)
  .patch(
    authController.routeProtect,
    authController.authorise("admin"),
    tourController.uploadFields,
    tourController.addAndUpdateTour("edit")
  )
  .delete(
    authController.routeProtect,
    authController.authorise("admin"),
    tourController.deleteTour
  );

router.post(
  "/create-checkout-session",
  authController.routeProtect,
  tourController.bookTours
);
module.exports = router;
