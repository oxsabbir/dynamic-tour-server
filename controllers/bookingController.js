const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const FilterAndPaginate = require("../utils/FilterAndPaginate");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.getAllBookings = catchAsync(async function (req, res, next) {});

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
      description: "Guides Fee",
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
    success_url: `${process.env.CLIENT_URL}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${product[0]?.tourId}`,
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

    console.log(booking);
  };

  const sig = request.headers["stripe-signature"];
  let event;
  console.log(
    stripe.webhooks.constructEvent(request.body, sig, endpointSecret)
  );

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.async_payment_failed":
      console.log("failed");
      const checkoutSessionAsyncPaymentFailed = event.data.object;
      // Then define and call a function to handle the event checkout.session.async_payment_failed
      break;
    case "checkout.session.async_payment_succeeded":
      const checkoutSessionAsyncPaymentSucceeded = event.data.object;
      console.log("success");
      console.log(event.data.object);
      // Then define and call a function to handle the event checkout.session.async_payment_succeeded
      break;
    case "checkout.session.completed":
      const checkoutSessionCompleted = event.data.object;
      console.log("-----------comeplete", checkoutSessionCompleted);
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
      console.log(chargeUpdated.receipt_url);
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

exports.createBooking = catchAsync(async function (req, res, next) {
  const { user, tour, price } = req.query;
  console.log(req.params);
  if (!user || !tour || !price)
    return next(
      new AppError("Must provide tour price and user in params", 400)
    );
  const booking = await Booking.create({ tour, user, price });

  if (!booking) return next(new AppError("No booking created", 400));
  res.redirect(req.originalUrl.split("?")[0]);

  // res.status(201).json({
  //   success: "success",
  //   message: "Successfully booked a tour",
  //   data: {
  //     booking,
  //   },
  // });
});
