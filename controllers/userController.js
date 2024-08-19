const User = require("./../models/User");
const catchAsync = require("../utils/catchAsync");

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

exports.updateUser = catchAsync(async function (req, res, next) {});
