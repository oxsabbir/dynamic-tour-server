const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Booking = require("../models/Booking");

exports.getSalesStats = catchAsync(async function (req, res, next) {
  const filterType = req.query?.filter || null;

  if (
    req.query.filter &&
    req.query?.filter !== "today" &&
    req.query?.filter !== "week" &&
    req.query?.filter !== "month" &&
    req.query?.filter !== "year"
  )
    return next(
      new AppError(
        "Please provide correct filterType, e.g. today,week,month,year",
        403
      )
    );

  const dayCount = {
    today: 0,
    week: 7,
    month: 30,
    year: 365,
  };

  let day = dayCount[filterType];

  const dayInMillS = day * 24 * 60 * 60 * 1000;

  let filterDate = null;
  if (filterType !== null) {
    filterDate = new Date(Date.now() - dayInMillS).toISOString();
  }

  const [boookingSales] = await Booking.aggregate([
    {
      $match: {
        createdAt: filterDate ? { $gt: new Date(filterDate) } : { $ne: false },
      },
    },
    {
      $group: {
        _id: null,
        totalSells: { $sum: "$price" },
        averageSells: { $avg: "$price" },
        totalBookings: { $sum: 1 },
      },
    },
  ]);

  // trying in the past

  res.status(200).json({
    status: "success",
    filter: filterType,

    data: {
      totalSells: {
        amount: boookingSales?.totalSells || 0,
        rate: 23,
        increased: false,
      },
      averageSells: {
        amount: boookingSales?.averageSells || 0,
        rate: 120,
        increased: true,
      },
      totalBookings: {
        amount: boookingSales?.totalBookings || 0,
        rate: 5,
        increased: true,
      },
    },
  });
});
