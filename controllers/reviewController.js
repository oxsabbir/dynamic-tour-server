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

  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    data: {
      review,
    },
  });
});

exports.updateReview = catchAsync(async function (req, res, next) {
  // getting the review id from params
  let reviewId = req.params?.id;
  if (!reviewId) return next(new AppError("No review id found", 404));
  // setting the body user to loggedin user
  req.body.user = req.user?.id;
  req.body.updatedAt = Date.now();

  const review = await Review.findByIdAndUpdate(reviewId, req.body, {
    new: true,
  });
  if (!review) return next(new AppError("No review found with the id", 400));

  res.status(200).json({
    status: "success",
    message: "Review updated successfully",
    data: {
      review,
    },
  });
});

exports.deleteReview = catchAsync(async function (req, res, next) {
  // getting the review id from params
  let reviewId = req.params?.id;
  if (!reviewId) return next(new AppError("No review id found", 404));

  const deletedReview = await Review.findByIdAndDelete(reviewId);
  if (!deletedReview)
    return next(new AppError("No review found to delete", 400));

  res.status(204).json({
    status: "success",
    message: "Review deleted successfully",
    data: {
      review: deletedReview,
    },
  });
});
