const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Booking = require("../models/Booking");

exports.getSalesStats = catchAsync(async function (req, res, next) {
  const filterType = req.query?.filter || "month";

  res.status(200).json({
    status: "success",
    filter: filterType,

    data: {
      totalSells: {
        amount: 234532,
        rate: 23,
        increased: false,
      },
      averageSells: {
        amount: 234532,
        rate: 120,
        increased: true,
      },
      totalBookings: {
        amount: 213,
        rate: 5,
        increased: true,
      },
    },
  });
});
