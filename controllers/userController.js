const User = require("./../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getAllUser = catchAsync(async function (req, res, next) {
  const allUser = await User.find().select("-password -__v -createdAt");
  res.status(200).json({
    status: "success",
    message: "User data retrive successfully",
    data: {
      total: allUser.length,
      user: allUser,
    },
  });
});

exports.getUserByUserName = catchAsync(async function (req, res, next) {
  let userName = req.params?.userName;

  if (!userName) return next(new AppError("No username found", 404));

  const user = await User.findOne({ userName }).select(
    "-password -__v -createdAt -email "
  );

  if (!user) return next(new AppError("No user found", 404));

  res.status(200).json({
    status: "success",
    message: "User data retrive successfully",
    data: {
      user,
    },
  });
});

exports.getUser = catchAsync(async function (req, res, next) {
  let id = req.params?.userId;
  if (!id) return next(new AppError("No user id found", 404));

  const user = await User.findById(id).select("-password -__v -createdAt");
  if (!user) return next(new AppError("No user found", 404));

  res.status(200).json({
    status: "success",
    message: "User data retrive successfully",
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async function (req, res, next) {});
