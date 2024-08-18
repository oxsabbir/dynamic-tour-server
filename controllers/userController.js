const User = require("./../models/User");
const catchAsync = require("../utils/catchAsync");

const upload = require("../utils/uploadFiles");

exports.getAllUser = catchAsync(async function (req, res, next) {
  const allUser = await User.find().select("-password -__v");
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

exports.updateProfile = catchAsync(async function (req, res, next) {
  console.log(req.body);
  console.log(req.params?.userName);
  next();
});
