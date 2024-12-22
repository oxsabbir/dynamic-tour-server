const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Booking = require("../models/Booking");

exports.getSalesStats = catchAsync(async function (req, res, next) {
  const filterType = req.query?.filter || "month";

  const dayCount = {
    today: 0,
    week: 7,
    month: 30,
    year: 365,
  };

  let day = dayCount[filterType];

  const dayInMillS = day * 24 * 60 * 60 * 1000;

  const filterDate = new Date(Date.now() - dayInMillS).toISOString();
  console.log(filterDate);

  const boookingSales = await Booking.aggregate([
    { $match: { createdAt: { $lt: new Date() } } },
    {
      $group: {
        _id: null,
        totalSells: { $sum: "$price" },
        averageSells: { $avg: "$price" },
        totalBookings: { $sum: 1 },
      },
    },
  ]);

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
