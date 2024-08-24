const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const { routeProtect } = require("../controllers/authController");

router
  .route("/")
  .get(reviewController.getAllReview)
  .post(routeProtect, reviewController.addReview);

router
  .route("/:id")
  .patch(routeProtect, reviewController.updateReview)
  .delete(routeProtect, reviewController.deleteReview);

module.exports = router;