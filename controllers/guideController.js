const ApplyFilter = require("../utils/ApplyFilter");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");

exports.getGuides = catchAsync(async function (req, res, next) {
  const guides = await User.find({ role: "guide" });
  if (!guides) return next(new AppError("No Guides Found", 404));

  res.status(200).json({
    status: "success",
    data: {
      guides,
    },
  });
});

exports.becomeGuide = catchAsync(async function (req, res, next) {
  const guideStatus = "";
  // add pending to true

  //
});
