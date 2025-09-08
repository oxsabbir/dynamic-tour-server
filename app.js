const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const userRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const tourRouter = require("./routes/tourRouter");
const reviewRouter = require("./routes/reviewRouter");
const guideRouter = require("./routes/guideRouter");
const bookingRouter = require("./routes/bookingRouter");
const statsRouter = require("./routes/statsRouter");

const webhookMethod =
  require("./controllers/bookingController").getEventResponse;

app.use(cors());

app.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  webhookMethod
);
// getting the http body data, Body parser

// setting cookie parser
app.use(cookieParser());

app.get("/", (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Server is up and running",
  });
});
app.use("/api", express.json());
app.use("/api", express.urlencoded({ extended: true }));
// Defining required routes
app.use("/api/v1/", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/guide", guideRouter);
app.use("/api/v1/tour", tourRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/statistic", statsRouter);

// sending response for undefined route
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "not-found",
    message: `Cannot find ${req.originalUrl} on the server`,
  });
});

// global error handling middleware
app.use((err, req, res, next) => {
  console.log("error from global -", err);
  console.log(err);
  res.status(err.statusCode || 403).json({
    status: "error",
    message: err,
  });
});

module.exports = app;
