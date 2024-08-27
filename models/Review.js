const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      require: [true, "A review must have tour id"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: [true, "A review must have a user id"],
    },
    rating: {
      type: Number,
      require: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      require: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// using the query middleware to populate the user inside the reviews
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "fullName profileImage firstName lastName",
  });
  next();
});

const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
