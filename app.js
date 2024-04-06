const express = require("express");
const app = express();
const userRouter = require("./routes/userRouter");

// getting the http body data, Body parser
app.use(express.json());

// sending response for undefined route

// Defining required routes
app.use("/api/v1/user", userRouter);

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
  console.log("error from global");
  res.status(err.statusCode || 403).json({
    status: "error",
    message: err.message,
  });
});

module.exports = app;
