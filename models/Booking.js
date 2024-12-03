const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      require: [true, "A booking must have a tour id"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: [true, "A booking must have a user id"],
    },
    guide: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: [true, "A booking must have a guide id"],
    },
    startDate: {
      type: Date,
      require: [true, "A booking must have a data"],
    },
    price: {
      type: Number,
      require: [true, "A booking must have a price"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const bookingModel = mongoose.model("Booking", bookingSchema);

module.exports = bookingModel;
