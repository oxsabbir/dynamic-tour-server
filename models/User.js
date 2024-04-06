const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {},
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
