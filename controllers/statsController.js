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

  let filterDate = { current: null, previous: null };
  if (filterType !== null) {
    filterDate.current = new Date(Date.now() - dayInMillS).toISOString();
    filterDate.previous = new Date(Date.now() - dayInMillS * 2).toISOString();
  }

  const [boookingSales] = await Booking.aggregate([
    {
      $facet: {
        previous: [
          {
            $match: {
              $and: [
                { createdAt: { $gte: new Date(filterDate.previous) } },
                { createdAt: { $lte: new Date(filterDate.current) } },
              ],
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
        ],
        current: [
          {
            $match: {
              $and: [
                { createdAt: { $gte: new Date(filterDate.current) } },
                { createdAt: { $lte: new Date() } },
              ],
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
        ],
      },
    },
  ]);

  const getParcentangeChanges = function (previousSales, currentSales) {
    // formula to count parcentage
    // ((current - previous) / previous) * 100

    const changesRate = {
      totalSells: { increased: false, amount: 0 },
      averageSells: { increased: false, amount: 0 },
      totalBookings: { increased: false, amount: 0 },
    };

    // calculation
    changesRate.totalSells.amount =
      ((currentSales.totalSells - previousSales.totalSells) /
        previousSales.totalSells) *
      100;
    changesRate.totalSells.amount === Infinity
      ? (changesRate.totalSells.amount = "Infinity")
      : "";
    changesRate.totalSells.amount > 0
      ? (changesRate.totalSells.increased = true)
      : (changesRate.totalSells.increased = false);

    changesRate.averageSells.amount =
      ((currentSales.averageSells - previousSales.averageSells) /
        previousSales.averageSells) *
      100;
    changesRate.averageSells.amount === Infinity
      ? (changesRate.averageSells.amount = "Infinity")
      : "";
    changesRate.averageSells.amount > 0
      ? (changesRate.averageSells.increased = true)
      : (changesRate.averageSells.increased = false);

    changesRate.totalBookings.amount =
      ((currentSales.totalBookings - previousSales.totalBookings) /
        previousSales.totalBookings) *
      100;
    changesRate.totalBookings.amount === Infinity
      ? (changesRate.totalBookings.amount = "Infinity")
      : "";
    changesRate.totalBookings.amount > 0
      ? (changesRate.totalBookings.increased = true)
      : (changesRate.totalBookings.increased = false);

    return changesRate;
  };

  const dataField = {
    totalSells: 0,
    averageSells: 0,
    totalBookings: 0,
  };

  const previousSalesData =
    boookingSales?.previous.length > 0 ? boookingSales?.previous[0] : dataField;
  const currentSalesData =
    boookingSales?.current.length > 0 ? boookingSales?.current[0] : dataField;

  // getting the changes
  const changesParcentage = getParcentangeChanges(
    previousSalesData,
    currentSalesData
  );

  res.status(200).json({
    status: "success",
    filter: filterType,

    data: {
      totalSells: {
        amount: +boookingSales?.current[0]?.totalSells?.toFixed(2) || 0,
        changes: changesParcentage.totalSells,
      },
      averageSells: {
        amount: +boookingSales?.current[0]?.averageSells?.toFixed(2) || 0,
        changes: changesParcentage.averageSells,
      },
      totalBookings: {
        amount: +boookingSales?.current[0]?.totalBookings?.toFixed(2) || 0,
        changes: changesParcentage.totalBookings,
      },
    },
  });
});
