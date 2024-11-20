const ApplyFilter = require("../utils/ApplyFilter");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");

exports.getAllGuide = catchAsync(async function (req, res, next) {
  const guide = await User.find({ role: "guide" });
  if (!guide) return next(new AppError("No Guides Found", 404));

  res.status(200).json({
    status: "success",
    total: guide.length,
    data: {
      guide,
    },
  });
});

exports.getGuide = catchAsync(async function (req, res, next) {
  const guideId = req.params?.id;
  if (!guideId) return next(new AppError("no id for found for guide", 404));

  const guide = await User.findOne({ role: "guide" });
  if (!guide) return next(new AppError("No Guides Found", 404));

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
      message: "Admin cannot become guide",
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
  const guideId = req.params?.id;
  if (!guideId) return next(new AppError("No guide id found", 404));
  const acceptedGuide = await User.findOneAndUpdate(
    { id: guideId, readyForGuide: false },
    {
      readyForGuide: true,
      role: "guide",
    },
    { new: true }
  );

  if (!acceptedGuide)
    return next(new AppError("No guide found to accept", 404));

  res.status(200).json({
    status: "success",
    message: "Successfully accepted guide request",
    data: {
      guide: acceptedGuide,
    },
  });
});

exports.rejectGuide = catchAsync(async function (req, res, next) {
  // the id of the guide to accept coming from params
  const guideId = req.params?.id;
  if (!guideId) return next(new AppError("No guide id found", 404));
  const rejectedGuide = await User.findOneAndUpdate(
    { id: guideId, readyForGuide: true },
    {
      readyForGuide: false,
    },
    { new: true }
  );

  if (!rejectedGuide)
    return next(new AppError("No guide found to reject", 404));

  res.status(200).json({
    status: "success",
    message: "Successfully rejected guide request",
    data: {
      guide: rejectedGuide,
    },
  });
});

exports.deleteGuide = catchAsync(async function (req, res, next) {
  const guideId = req.params?.id;
  if (!guideId) return next(new AppError("No guide id found to delete", 404));

  const deletedGuide = await User.findOneAndUpdate(
    {
      id: guideId,
      readyForGuide: true,
      role: { $eq: "guide" },
    },
    {
      role: "user",
      readyForGuide: false,
    }
  );

  if (!deletedGuide) return next(new AppError("No guide found to delete", 404));

  res.status(204).json({
    status: "success",
    message: "successfully deleted a guide",
    data: {
      guide: deletedGuide,
    },
  });
});
