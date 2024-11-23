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

// getting the http body data, Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// setting cookie parser
app.use(cookieParser());

app.use(cors());

app.get("/", (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Server is up and running",
  });
});

// Defining required routes
app.use("/api/v1/", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/guide", guideRouter);
app.use("/api/v1/tour", tourRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/booking", bookingRouter);

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
