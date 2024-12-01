const dotenv = require("dotenv").config({ path: "./config.env" });

const app = require("./app");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const express = require("express");
const stripe = require("stripe");

// configuring environtment variable

// configuring cloudinary

cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// handling upcaughtException
process.on("uncaughtException", (err) => {
  console.log(err.message, err.message);
  process.exit(1);
});

// connecting to the database
const DATABASE_URL = process.env.DATABASE;
const DATABASE_PASSWORD = process.env.PASSWORD;
const PORT = process.env.PORT || 4000;

mongoose
  .connect(
    DATABASE_URL.replace("<PASSWORD>", DATABASE_PASSWORD, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: true,
    })
  )
  .then(() => console.log("DATABASE CONNECTED SUCCESSFULLY"));

const endpointSecret =
  "whsec_d53642d79b2c5a283c7c547ebeb2d6b6d198fc3e8ccf97fb4b13d5179905bf65";
const defaultWebhook = async function () {};

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
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
        console.log(event.data.object);
        // Then define and call a function to handle the event checkout.session.async_payment_succeeded
        break;
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        // Then define and call a function to handle the event checkout.session.completed
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
  }
);

// starting server
const server = app.listen(PORT, "0.0.0.0", (res) => {
  console.log(`Server started at ${"localhost"} port number is : ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.message, err.name);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
