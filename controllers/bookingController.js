const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const User = require("../models/User");
const AppError = require("../utils/AppError");
// to work with env variable
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
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
      image: tourData?.coverImage,
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
    success_url: `${req.protocol}://${req.get("host")}/api/v1/booking?tour=${product[0]?.tourId}&user=${
      req.user.id
    }&price=${product[0]?.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${product[0]?.tourId}`,
  });

  res.status(201).json({
    status: "success",
    data: {
      session: session,
    },
  });
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
