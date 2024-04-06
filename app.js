const express = require("express");

const app = express();

// sending response for undefined route
app.use("/", (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Server is up and running",
  });
});

app.use("*", (req, res, next) => {
  res.send(`Cannot find ${req.originalUrl} at the server`);
});

module.exports = app;
