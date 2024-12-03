const Tour = require("../models/Tour");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { upload, uploadCloudinary } = require("../utils/uploadFiles");
const ApplyFilter = require("../utils/ApplyFilter");

const FilterAndPaginate = require("../utils/FilterAndPaginate");

// to work with env variable

exports.getAllTours = catchAsync(async function (req, res, next) {
  const findQuery = Tour.find();
  const mainData = await FilterAndPaginate(findQuery, req, "title", 12);

  res.status(200).json({
    status: "success",
    message: "Tour retrive successfully",
    pagination: mainData.pagination,
    data: {
      total: mainData.dataList.length,
      tour: mainData.dataList,
    },
  });
});

exports.getToursByType = catchAsync(async function (req, res, next) {
  const type = req.query?.type;
  const userId = req.query?.userId;
  if (!type || !userId) return next(new AppError("No type user found", 404));
  let tours;
  switch (type) {
    case type === "upcoming": {
      break;
    }
    case type === "completed": {
      break;
    }
    case type === "review": {
      break;
    }
    default: {
      tours = null;
    }
  }
  if (!tours) return next(new AppError("No tour found", 404));
});

exports.getTour = catchAsync(async function (req, res, next) {
  const id = req.params?.tourId;

  if (!id) return next(new AppError("No tour id found", 404));
  const tour = await Tour.findById(id)
    .select("+createdAt")
    .populate([
      { path: "guides", select: "-password -role" },
      // { path: "reviews" },
    ]);

  if (!tour) return next(new AppError("No tour found", 404));

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

// upload middleware
exports.uploadFields = upload.any();

exports.addAndUpdateTour = function (actionType) {
  return catchAsync(async function (req, res, next) {
    // actionType === add ? means adding new tours
    // actionType === edit ? means editing existing tours
    // console.log(req.body, req?.files);

    const editableTourId = req.params?.tourId;
    // get the body data and filter it
    let tourData;

    if (actionType === "add") {
      tourData = req.body;
    }

    if (actionType === "edit") {
      let editableTour = await Tour.findById(editableTourId);
      const keys = Object.keys(req.body).forEach((item) => {
        editableTour[item] = req?.body[item];
      });

      tourData = editableTour;
    }
    // parsing the location data
    if (typeof req.body?.locations === "string") {
      tourData.locations = JSON.parse(req.body?.locations);
    }

    console.log(tourData, "the main data");
    console.log(req.body?.locations, "the data");

    // creating newTour doucment will save it later down
    let newTour = new Tour(tourData);
    if (actionType === "edit") {
      newTour = tourData;
    }

    const uploadByFolder = async function (buffer, folder, fieldName) {
      // upload the file one after another
      const result = await uploadCloudinary(buffer, folder);
      if (!result?.secure_url)
        return next(new AppError("Uplaoding Image Error", 500));
      return result;
    };

    const fulldata = req?.files?.map(async (item, i) => {
      const fieldName = item.fieldname;
      if (item.fieldname.startsWith("images")) {
        // upload the image and send the link
        const result = await uploadByFolder(
          item.buffer,
          `tour/${newTour.id}/${fieldName}`
        );
        newTour["images"] = [...newTour["images"], result?.secure_url];
      }

      // get the cover image and upload the cover image
      if (item.fieldname === "coverImage") {
        const result = await uploadByFolder(
          item.buffer,
          `tour/${newTour.id}/${item.fieldname}`,
          item.fieldname
        );
        newTour[fieldName] = result.secure_url;
      }

      // get startlocation image
      if (item.fieldname === "startLocation[images]") {
        const result = await uploadByFolder(
          item.buffer,
          `tour/${newTour.id}/${item.fieldname}`,
          item.fieldname
        );
        newTour["startLocation"]["images"] = newTour["startLocation"]["images"]
          ? [...newTour["startLocation"]["images"], result?.secure_url]
          : [result?.secure_url];
      }
      // get all the location image
      if (item.fieldname.startsWith("locations")) {
        // console.log(newTour, "the tour");
        const result = await uploadByFolder(
          item.buffer,
          `tour/${newTour.id}/${item.fieldname}`,
          item.fieldname
        );

        let locationIndex = +fieldName.slice(10, 11);
        // console.log(newTour["locations"], "here i am ");
        // console.log(locationIndex, "here i am ");

        newTour["locations"][locationIndex]["images"] = newTour["locations"][
          locationIndex
        ]["images"]
          ? [
              ...newTour["locations"][locationIndex]["images"],
              result?.secure_url,
            ]
          : [result?.secure_url];
        newTour["images"] = [...newTour["images"], result?.secure_url];
      }
      return true;
    });

    // stopping the code for image to uplaod and then send the response
    if (fulldata) {
      await Promise.all(fulldata);
    }
    // uplaod the document to database after everything is complete

    let realData;
    if (actionType === "add") {
      realData = await newTour.save({ validateBeforeSave: false });
    }
    if (actionType === "edit") {
      realData = await Tour.findByIdAndUpdate(editableTourId, newTour, {
        new: true,
      });
    }

    // send the response
    res.status(201).json({
      status: "success",
      message:
        actionType === "add"
          ? "tour created successfully"
          : "tour updated successfully",
      data: {
        tour: realData,
      },
    });
  });
};

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
