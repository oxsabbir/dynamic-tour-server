const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const FilterAndPaginate = require("../utils/FilterAndPaginate");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.getAllBookings = catchAsync(async function (req, res, next) {
  let findQuery = Booking.find();

  if (req.query.query) {
    const searchedData = await Booking.aggregate([
      {
        $lookup: {
          from: "users", // The collection name of the `Tour` model
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" }, // Unwind the array created by `$lookup`
      {
        $match: {
          "userDetails.fullName": {
            $regex: `^${req.query.query?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") || req.query.query}`, // Matches titles starting with the prefix
            $options: "i", // Case-insensitive matching
          },
        },
      }, // Match the title
      {
        $project: {
          userDetails: 0, // Exclude the tourDetails from the output if not needed
        },
      },
    ]);
    // getting all the id from the aggregation
    const bookingIds = searchedData.map((item) => item._id);

    findQuery = Booking.find({ _id: { $in: bookingIds } });

    req.query.query = undefined;
  }

  const mainData = await FilterAndPaginate(
    findQuery,
    req,
    "price",
    9,
    next,
    "Bookings"
  );

  res.status(200).json({
    status: "success",
    message: "Bookings retrive successfully",
    pagination: mainData.pagination,
    data: {
      total: mainData.dataList.length,
      tour: mainData.dataList,
    },
  });
});

exports.getUserBookingCount = catchAsync(async function (req, res, next) {
  const userName = req.params.userName;
  if (!userName) return next(new AppError("username not found", 404));

  const user = await User.findOne({ userName: userName }).select("_id role");

  let fieldToSearch = user.role === "guide" ? "guide" : "user";

  const date = new Date();
  const completed = await Booking.find({
    [fieldToSearch]: user.id,
    startDate: { $lt: date },
  }).countDocuments();
  const upcoming = await Booking.find({
    [fieldToSearch]: user.id,
    startDate: { $gt: date },
  }).countDocuments();

  res.status(200).json({
    status: "success",
    message: "Bookings count retrive successfully",
    data: {
      upcoming: upcoming,
      completed: completed,
    },
  });
});

exports.getUserBooking = catchAsync(async function (req, res, next) {
  const userName = req.params.userName;
  const filterValue = req.params?.filterValue;

  if (!userName && !filterValue)
    return next(new AppError("Username or filtervalue not found", 404));

  const userId = await User.findOne({ userName: userName }).select("_id");
  // complete means startDate > currentDate
  // upcoming means startDate < currentDate
  // review means startDate > currentDate || not reviewed
  //
  const date = new Date();
  let filterObject;

  if (filterValue === "complete") {
    filterObject = { $lt: date };
  } else if (filterValue === "upcoming") {
    filterObject = { $gt: date };
  } else if (filterValue === "review") {
    filterObject.startDate = { $lt: date };
  }

  const findQuery = Booking.find({
    user: userId.id,
    startDate: filterObject,
  });

  const mainData = await FilterAndPaginate(
    findQuery,
    req,
    "price",
    6,
    next,
    "Bookings"
  );

  res.status(200).json({
    status: "success",
    message: "Bookings retrive successfully",
    pagination: mainData.pagination,
    data: {
      total: mainData.dataList.length,
      booking: mainData.dataList,
    },
  });
});

exports.getPaymentSession = catchAsync(async function (req, res, next) {
  const sessionId = req.params.sessionId;
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const data = {
    price: session.amount_total / 100,
    name: session.customer_details.name,
    paymentStatus: session.payment_status,
  };

  res.status(200).json({
    status: "success",
    data: {
      paymentInfo: data,
    },
  });
});

exports.getCheckoutSession = catchAsync(async function (req, res, next) {
  const { tourId, guideId, startDate } = req.params;
  if (!tourId || !guideId || !startDate)
    return next(new AppError("No tourId or guideId or startDate found", 404));

  const tourData = await Tour.findById(tourId);
  const selectedGuide = await User.findById(guideId).select("-password");

  const product = [
    {
      name: tourData?.title,
      description: tourData?.summery,
      image: tourData?.coverImage,
      tourId: tourData?.id,
      price: tourData?.discountPrice ? tourData.discountPrice : tourData?.price,
    },
    {
      name: selectedGuide?.fullName,
      image: selectedGuide?.profileImage,
      price: selectedGuide?.price,
      description: "Guide Fee",
    },
  ];

  // line item for the item being proccessed
  const lineItems = product?.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        description: item?.description,
        images: [item.image],
      },
      unit_amount: Math.round(item.price) * 100,
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/order-success/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/order-failed/{CHECKOUT_SESSION_ID}`,
    metadata: {
      guide_id: selectedGuide.id,
      tour_id: tourId, // Adding custom metadata (tour ID)
      user_id: req.user.id, // Adding custom metadata (user ID)
      start_date: startDate,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      session: session,
    },
  });
});

exports.getEventResponse = catchAsync(async function (request, response, next) {
  const endpointSecret = process.env.WEB_HOOK_SECRET;

  const createBooking = async function (
    tourId,
    guideId,
    userId,
    price,
    startDate
  ) {
    // checking if  tourid guideid userid price these field are there
    if (!tourId || !userId || !guideId || !price || !startDate)
      return next(new AppError("Some require information is missing", 400));
    // create booking
    const booking = await Booking.create({
      tour: tourId,
      guide: guideId,
      user: userId,
      price: price,
      startDate: startDate,
    });
  };

  const sig = request.headers["stripe-signature"];

  console.log("-------------try--------------");
  console.log("signature:", sig);
  console.log("secret:", endpointSecret);
  console.log("raw type:", request.rawBody);
  console.log("raw buffer length:", request.rawBody?.length);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      endpointSecret
    );
    console.log(event);
  } catch (err) {
    console.log(err);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.async_payment_failed":
      const checkoutSessionAsyncPaymentFailed = event.data.object;
      // Then define and call a function to handle the event checkout.session.async_payment_failed
      break;
    case "checkout.session.async_payment_succeeded":
      const checkoutSessionAsyncPaymentSucceeded = event.data.object;
      // Then define and call a function to handle the event checkout.session.async_payment_succeeded
      break;
    case "checkout.session.completed":
      const checkoutSessionCompleted = event.data.object;
      const price = checkoutSessionCompleted.amount_total / 100;
      const metaData = checkoutSessionCompleted.metadata;

      const bookingDetails = await createBooking(
        metaData.tour_id,
        metaData.guide_id,
        metaData.user_id,
        price,
        metaData.start_date
      );

      // get the userid , tourid, and the price from completed session

      // Then define and call a function to handle the event checkout.session.completed
      break;

    case "charge.updated":
      const chargeUpdated = event.data.object;
      break;

    case "checkout.session.expired":
      const checkoutSessionExpired = event.data.object;
      // Then define and call a function to handle the event checkout.session.expired
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});
