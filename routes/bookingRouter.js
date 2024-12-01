const express = require("express");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");
const router = express.Router();

router.get(
  "/create-checkout-session/:tourId/:guideId",
  authController.routeProtect,
  bookingController.getCheckoutSession
);

router.get("/", bookingController.createBooking);

module.exports = router;
