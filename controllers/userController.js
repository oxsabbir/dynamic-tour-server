const User = require("./../models/User");
const catchAsync = require("../utils/catchAsync");

exports.createUser = catchAsync(async function (req, res, next) {
  const createdUser = await User.create(req.body);
  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: {
      user: createdUser,
    },
  });
});

exports.getAllUser = catchAsync(async function (req, res, next) {
  const allUser = await User.find();
  res.status(200).json({
    status: "success",
    message: "User data retrive successfully",
    data: {
      total: allUser.length,
      user: allUser,
    },
  });
});
