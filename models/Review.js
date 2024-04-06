const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {},
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
