const express = require("express");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");
const router = express.Router();
router.get("/", bookingController.getAllBookings);

router.get("/retrive-session/:sessionId", bookingController.getPaymentSession);

router.get(
  "/create-checkout-session/:tourId/:guideId/:startDate",
  authController.routeProtect,
  bookingController.getCheckoutSession
);

module.exports = router;
