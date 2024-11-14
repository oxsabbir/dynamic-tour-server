const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// configuring environtment variable
dotenv.config({ path: "./config.env" });

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
