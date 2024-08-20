const Tour = require("../models/Tour");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const upload = require("../utils/uploadFiles");

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

// upload middleware
exports.uploadFields = upload.any();

exports.addTour = catchAsync(async function (req, res, next) {
  // get the body data and filter it
  let tourData;
  tourData = req.body;

  // console.log(tourData);
  if (req.files.length < 1)
    return next(new AppError("No image file found", 404));

  req.files.forEach((item, i) => {
    if (item.fieldname === "images") {
      // console.log("images --", item);
      // upload the image and send the link
      tourData["images"] = tourData.images
        ? [...tourData.images, item]
        : [item];
    }

    if (item.fieldname === "coverImage") {
      // console.log("coverImage --", item);
      tourData["coverImage"] = item;
      // upload the image and send the link
    }
    if (item.fieldname === "startLocation[image]") {
      // console.log("startLocation", item);

      tourData.startLocation["image"] = tourData.startLocation.image
        ? [...tourData.startLocation.image, item]
        : [item];
    }
    if (item.fieldname.startsWith("locations")) {
      // console.log("location", item);
      // get the required index to the image link
      let locationIndex = +item.fieldname.slice(10, 11);
      tourData.locations[locationIndex]["image"] = tourData.locations[
        locationIndex
      ].image
        ? [...tourData.locations[locationIndex].image, item]
        : [item];
    }
  });

  console.log(tourData);
  // get the cover image and upload the cover image

  // get all the feature image and upload it

  // get startlocation image

  // get all the location image

  // send the response
  res.status(201).json({
    status: "success",
  });
});

exports.getTour = catchAsync(async function (req, res, next) {
  let id;
  if (req.params.id) {
    id = req.params.id;
  }
  const tour = await Tour.findById(id);

  if (!tour) {
    res.status(404).json({
      status: "fail",
      message: "No tour found !",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async function (req, res, next) {
  console.log("Hi");
  let id = req.params?.id;
  if (!id) return next("No tour found to delete");

  const tour = await Tour.findOneAndDelete({ _id: id });

  res.status(204).json({
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
