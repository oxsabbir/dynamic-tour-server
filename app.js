const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const userRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const tourRouter = require("./routes/tourRouter");
const reviewRouter = require("./routes/reviewRouter");
const tourController = require("./controllers/tourController");
// getting the http body data, Body parser
app.use(express.json());

// setting cookie parser
app.use(cookieParser());

app.use(cors());

app.use("/", (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: `Server is up and running on port : ${process.env.PORT}`,
  });
});

// Defining required routes
app.use("/api/v1/", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/tour", tourRouter);
app.use("/api/v1/review", reviewRouter);

// sending response for undefined route

app.use("*", (req, res, next) => {
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
