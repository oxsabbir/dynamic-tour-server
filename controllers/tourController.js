const Tour = require("../models/Tour");

const catchAsync = require("../utils/catchAsync");

exports.getAllTours = catchAsync(async function (req, res, next) {
  const allTour = await Tour.find();
  res.status(200).json({
    status: "success",
    data: {
      total: allTour.length,
      tour: allTour,
    },
  });
});

exports.getTour = catchAsync(async function (req, res, next) {
  let id;
  if (req.params.id) {
    id = req.params.id;
  }
  const tour = await Tour.findOne({ _id: id });
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async function (req, res, next) {
  let id;
  if (req.params.id) {
    id = req.params.id;
  }
  const updatedTour = await Tour.findByIdAndUpdate(id, req.body);

  res.status(200).json({
    status: "success",
    message: "Tour updated successfully",
    data: {
      tour: updatedTour,
    },
  });
});
