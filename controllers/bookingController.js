const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.getCheckoutSession = catchAsync(async function (req, res, next) {
  const { tourId, guideId } = req.params;
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

  // ${req.protocol}://${req.get("host")}/api/v1/booking?tour=${product[0]?.tourId}&user=${
  //     req.user.id
  //   }&price=${product[0]?.price}

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${product[0]?.tourId}`,
    metadata: {
      tour_id: tourId, // Adding custom metadata (tour ID)
      user_id: req.user.id, // Adding custom metadata (user ID)
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
      console.log("complete");

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
