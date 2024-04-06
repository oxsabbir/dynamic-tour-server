const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// configuring environtment variable
dotenv.config({ path: "./config.env" });

// handling upcaughtException
process.on("uncaughtException", (err) => {
  console.log(err.message, err.message);
  process.exit(1);
});

// connecting to the database
const DATABASE_URL = process.env.DATABASE;
const DATABASE_PASSWORD = process.env.PASSWORD;

mongoose
  .connect(DATABASE_URL.replace("<PASSWORD>", DATABASE_PASSWORD))
  .then(() => console.log("DATABASE CONNECTED SUCCESSFULLY"));

// starting server
const server = app.listen(process.env.PORT, "127.0.0.1", () => {
  console.log(
    `Server started at ${"localhost"} port number is : ${process.env.PORT}`
  );
});

process.on("unhandledRejection", (err) => {
  console.log(err.message, err.name);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
