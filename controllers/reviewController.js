const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const Review = require("../models/Review");

exports.getAllReview = catchAsync(async function (req, res, next) {
  const review = await Review.find();

  res.status(200).json({
    status: "success",
    message: "Retrive review successfully",
    result: review?.length,
    data: {
      review,
    },
  });
});

exports.addReview = catchAsync(async function (req, res, next) {
  // setting the body user to login user
  req.body.user = req.user?.id;

  const review = await Review.create(req.body);
  if (!review)
    return next(new AppError("Something went wrong creating review", 500));

  res.status(200).json({
    status: "success",
    message: "Review created successfully",
    data: {
      review,
    },
  });
});

exports.updateReview = catchAsync(async function (req, res, next) {});
