const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {},
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const tourModel = mongoose.model("Tour", tourSchema);

module.exports = tourm;
