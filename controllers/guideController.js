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
  // check for if user is admin
  if (req.user?.role === "admin") {
    return res.status(200).json({
      status: "success",
      message: "An admin cannot become guide",
    });
  }
  // changing the status for normal user
  const guide = await User.findByIdAndUpdate(
    { id: req.user?.id },
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

exports.getPendingGuide = catchAsync(async function (req, res, next) {
  const pendingGuide = await User.find({ readyForGuide: true });
  if (!pendingGuide) return next(new AppError("No pending guide found", 404));
  res.status(200).json({
    status: "success",
    total: pendingGuide.length,
    data: {
      guide: pendingGuide,
    },
  });
});

exports.acceptGuide = catchAsync(async function (req, res, next) {
  // the id of the guide to accept coming from params
  const pendingGuide = await User.find({ readyForGuide: true });
});

exports.rejectGuide = catchAsync(async function (req, res, next) {
  // the id of the guide to reject coming from params
  const pendingGuide = await User.find({ readyForGuide: true });
});
