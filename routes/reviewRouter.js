const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const { routeProtect } = require("../controllers/authController");

router
  .route("/")
  .get(reviewController.getAllReview)
  .post(routeProtect, reviewController.addReview);

router.patch("/:id", routeProtect, reviewController.updateReview);

module.exports = router;
