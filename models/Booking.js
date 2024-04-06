const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {},
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const bookingModel = mongoose.model("Booking", bookingSchema);

module.exports = bookingm;
