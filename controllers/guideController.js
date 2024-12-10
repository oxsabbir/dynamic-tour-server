const ApplyFilter = require("../utils/ApplyFilter");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");

const FilterAndPaginate = require("../utils/FilterAndPaginate");

exports.getAllGuide = catchAsync(async function (req, res, next) {
  const findQuery = User.find({ role: "guide" }).select("-password");
  const guideData = await FilterAndPaginate(
    findQuery,
    req,
    "fullName",
    9,
    next,
    "Guides"
  );

  res.status(200).json({
    status: "success",
    message: "Guides retrive successfully",
    pagination: guideData.pagination,
    data: {
      total: guideData.dataList.length,
      guide: guideData.dataList,
    },
  });
});

exports.getGuide = catchAsync(async function (req, res, next) {
  const guideId = req.params?.id;
  if (!guideId) return next(new AppError("no id for found for guide", 404));

  const guide = await User.findOne({ role: "guide", _id: guideId })
    .select("-password")
    .populate("reviews");
  if (!guide) return next(new AppError("No Guides Found", 404));

  res.status(200).json({
    status: "success",
    data: {
      guide,
    },
  });
});

exports.becomeGuide = catchAsync(async function (req, res, next) {
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
  const price = req.body?.price;

  if (!price)
    return next(new AppError("Please provide a price per people", 400));
  // changing the status for normal user
  const guide = await User.findByIdAndUpdate(
    { _id: req.user?.id },
    {
      readyForGuide: true,
      price,
    },
    { new: true }
  ).select("-password");

  res.status(200).json({
    status: "success",
    message: "Successfully applied to become a guide",
    data: {
      guide,
    },
  });
});

exports.getPendingGuide = catchAsync(async function (req, res, next) {
  const findQuery = User.find({
    readyForGuide: true,
    role: { $ne: "guide" },
  }).select("-password");

  const guideData = await FilterAndPaginate(
    findQuery,
    req,
    "fullName",
    9,
    next,
    "Guides"
  );
  if (!guideData) return next(new AppError("No pending guide found", 404));

  res.status(200).json({
    status: "success",
    pagination: guideData.pagination,
    data: {
      total: guideData.dataList.length,
      guide: guideData.dataList,
    },
  });
});

exports.acceptGuide = catchAsync(async function (req, res, next) {
  // the id of the guide to accept coming from params
  const guideId = req.params?.id;
  if (!guideId) return next(new AppError("No guide id found", 404));
  const acceptedGuide = await User.findOneAndUpdate(
    { _id: guideId, readyForGuide: true, role: { $ne: "guide" } },
    {
      role: "guide",
    },
    { new: true }
  ).select("-password");

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
  console.log(guideId);
  const rejectedGuide = await User.findOneAndUpdate(
    { _id: guideId, readyForGuide: true },
    { readyForGuide: false },
    { new: true }
  ).select("-password");

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
      _id: guideId,
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
