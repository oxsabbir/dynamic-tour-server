const mongoose = require("mongoose");

const Tour = require("../models/Tour");

const reviewSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "A review must have tour id"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A review must have a user id"],
    },
    rating: {
      type: Number,
      required: [true, "Review must need a rating"],
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: [true, "Must need a review"],
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
    select: "fullName profileImage userName",
  });
  next();
});

// indexing the tour and user to be able to set the review to unique to a user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// using the statics methods and aggregation to calculate the totalRating and ratingsAverage
reviewSchema.statics.calculateRating = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        average: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      totalRating: stats[0]?.nRating,
      ratingsAverage: stats[0]?.average?.toFixed(1),
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      totalRating: 0,
      ratingsAverage: 4.5,
    });
  }
};

// calling the statics method for save the calculated data into the tour document
reviewSchema.post("save", function () {
  console.log(this.tour._id);
  this.constructor.calculateRating(this.tour._id);
});

// calling the method again to recalculate again if review was deleted or updated
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // passing the current document clone from where we can found the model and call the statics method
  this.currentDoc = await this.clone().findOne();
  next();
});

// calling the actual function to calculate the rating and average

reviewSchema.post(/^findOneAnd/, async function () {
  const tourId = this.currentDoc?.tour;
  this.currentDoc?.constructor.calculateRating(tourId);
});

const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
