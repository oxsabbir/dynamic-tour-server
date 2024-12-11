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
    isComplete: {
      type: Boolean,
      default: function () {
        return new Date(this.startDate) < new Date();
      },
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

bookingSchema.pre(/^find/, async function (next) {
  this.populate({
    path: "user",
    select: "fullName profileImage userName",
  })
    .populate({
      path: "tour",
      select: "title coverImage price ratingsAverage",
    })
    .populate({
      path: "guide",
      select: "fullName profileImage price userName",
    });
  next();
});

const bookingModel = mongoose.model("Booking", bookingSchema);

module.exports = bookingModel;
