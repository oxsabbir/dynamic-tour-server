const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Review = require("../models/Review");
const ApplyFilter = require("../utils/ApplyFilter");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

exports.getAllReview = catchAsync(async function (req, res, next) {
  const tourId = req.params?.tourId;

  const token = req.headers?.authorization?.split(" ");
  const decoded = token && jwt.verify(token[1], process.env.JWT_SECRET);

  const authReview =
    decoded?.id && (await Review.findOne({ user: decoded.id, tour: tourId }));

  let searchQuery = {};
  if (tourId && !authReview?.user) {
    searchQuery = { tour: tourId };
  } else if (tourId && authReview?.user) {
    searchQuery = { tour: tourId, user: { $ne: authReview?.user.id } };
  }

  const filteredTour = new ApplyFilter(req.query, Review.find(searchQuery))
    .sort()
    .page(6);

  const review = await filteredTour.dataQuery;

  res.status(200).json({
    status: "success",
    message: "Retrive review successfully",
    result: review?.length,
    data: {
      authReview,

      review,
    },
  });
});

exports.getReview = catchAsync(async function (req, res, next) {
  const reviewId = req.params?.id;
  const tourId = req.params?.tourId;

  const review = await Review.findOne(
    tourId
      ? {
          $and: [{ _id: reviewId }, { tour: tourId }],
        }
      : { _id: reviewId }
  );

  if (!review) return next(new AppError("No review found", 404));
  res.status(200).json({
    status: "success",
    message: "Retrive review successfully",
    data: {
      review,
    },
  });
});

exports.addReview = catchAsync(async function (req, res, next) {
  // setting the body user to login user
  req.body.user = req.user?.id;

  if (req.params?.tourId) {
    req.body.tour = req.params?.tourId;
  }

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
