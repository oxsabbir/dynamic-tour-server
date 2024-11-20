const ApplyFilter = require("../utils/ApplyFilter");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");

exports.getGuides = catchAsync(async function (req, res, next) {
  const guide = await User.find({ role: "guide" });
  if (!guides) return next(new AppError("No Guides Found", 404));

  res.status(200).json({
    status: "success",
    data: {
      guide,
    },
  });
});

exports.becomeGuide = catchAsync(async function (req, res, next) {
  let response;
  // if already applied for guide
  if (req.user?.readyForGuide && req.user?.readyForGuide === true) {
    return res.status(200).json({
      status: "success",
      message: "Already applied to become a guide",
    });
  }

  const guide = await User.findByIdAndUpdate(
    req.user?.id,
    {
      readyForGuide: true,
    },
    { new: true }
  ).select("-password -passwordChangedAt ");

  res.status(200).json({
    status: "success",
    message: "Successfully applied to become a guide",
    data: {
      guide,
    },
  });
});
