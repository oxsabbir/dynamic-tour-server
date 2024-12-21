const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getSalesStats = catchAsync(async function (req, res, next) {
  res.status(200).json({
    status: "success",
  });
});
