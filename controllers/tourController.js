const Tour = require("../models/Tour");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { upload, uploadCloudinary } = require("../utils/uploadFiles");
const ApplyFilter = require("../utils/ApplyFilter");

exports.getAllTours = catchAsync(async function (req, res, next) {
  const userQuery = req.query;
  const dataQuery = Tour.find();

  const filteredQuery = new ApplyFilter(userQuery, dataQuery)
    .filter()
    .page()
    .sort()
    .limitField();

  const allTour = await filteredQuery.dataQuery;

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

  if (req.files.length < 1)
    return next(new AppError("No image file found", 404));

  // creating newTour doucment will save it later down
  let newTour = new Tour(tourData);

  const uploadByFolder = async function (buffer, folder, fieldName) {
    // upload the file one after another
    const result = await uploadCloudinary(buffer, folder);

    if (!result?.secure_url)
      return next(new AppError("Uplaoding Image Error", 500));

    // save link into the new document

    if (fieldName === "coverImage") {
      newTour[fieldName] = result.secure_url;
    } else if (fieldName.startsWith("locations")) {
      let locationIndex = +fieldName.slice(10, 11);

      newTour["locations"][locationIndex]["images"] = newTour["locations"][
        locationIndex
      ]["images"]
        ? [...newTour["locations"][locationIndex]["images"], result?.secure_url]
        : [result?.secure_url];
    } else if (fieldName.startsWith("startLocation")) {
      newTour["startLocation"]["images"] = newTour["startLocation"]["images"]
        ? [...newTour["startLocation"]["images"], result?.secure_url]
        : [result?.secure_url];
    } else {
      newTour[fieldName] = newTour[fieldName]
        ? [...newTour[fieldName], result?.secure_url]
        : [result?.secure_url];
    }

    return true;
  };

  const fulldata = await req.files.map(async (item, i) => {
    if (item.fieldname === "images") {
      // upload the image and send the link
      return await uploadByFolder(
        item.buffer,
        `tour/${newTour.id}/${item.fieldname}`,
        item.fieldname
      );
    }

    // get the cover image and upload the cover image
    if (item.fieldname === "coverImage") {
      return await uploadByFolder(
        item.buffer,
        `tour/${newTour.id}/${item.fieldname}`,
        item.fieldname
      );
    }

    // get startlocation image
    if (item.fieldname === "startLocation[images]") {
      return await uploadByFolder(
        item.buffer,
        `tour/${newTour.id}/${item.fieldname}`,
        item.fieldname
      );
    }
    // get all the location image
    if (item.fieldname.startsWith("locations")) {
      return await uploadByFolder(
        item.buffer,
        `tour/${newTour.id}/${item.fieldname}`,
        item.fieldname
      );
    }
  });

  const result = await Promise.all(fulldata);

  // uplaod the document to database after everything is complete
  const realData = await newTour.save();

  // send the response
  res.status(201).json({
    status: "success",
    message: "tour created successfully",
    data: {
      tour: realData,
    },
  });
});

exports.getTour = catchAsync(async function (req, res, next) {
  const id = req.params?.tourId;

  if (!id) return next(new AppError("No tour id found", 404));
  const tour = await Tour.findById(id).select("+createdAt").populate("reviews");
  if (!tour) return next(new AppError("No tour found", 404));

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async function (req, res, next) {
  let id = req.params?.tourId;
  if (!id) return next(new AppError("No tour found to delete", 404));

  const deletedTour = await Tour.findByIdAndDelete(id);
  if (!deletedTour) return next(new AppError("No tour found", 404));

  res.status(204).json({
    status: "success",
    message: "Tour deleted successfully",
    data: {
      deletedTour,
    },
  });
});

exports.updateTour = catchAsync(async function (req, res, next) {
  const id = req.params?.tourId;

  if (!id) return next(new AppError("No tour found with the id", 404));

  // new = true is for returning the updated data
  const updatedTour = await Tour.findByIdAndUpdate(id, req.body, { new: true });

  if (!updatedTour)
    return next(new AppError("Cannot find a tour to update", 404));

  res.status(200).json({
    status: "success",
    message: "Tour updated successfully",
    data: {
      tour: updatedTour,
    },
  });
});
