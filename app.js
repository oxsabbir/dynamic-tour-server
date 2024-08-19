const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const userRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const tourRouter = require("./routes/tourRouter");

// getting the http body data, Body parser
app.use(express.json());

// setting cookie parser
app.use(cookieParser());

// Defining required routes
app.use("/api/v1/", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/tour", tourRouter);

// sending response for undefined route

app.use("*", (req, res, next) => {
  res.status(404).json({
    status: "not-found",
    message: `Cannot find ${req.originalUrl} on the server`,
  });
});

app.use("/", (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Server is up and running",
  });
});

// global error handling middleware

app.use((err, req, res, next) => {
  console.log("error from global -", err);
  res.status(err.statusCode || 403).json({
    status: "error",
    message: err,
  });
});

module.exports = app;
