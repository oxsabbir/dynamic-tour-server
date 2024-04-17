const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "A user must have firstname"],
      max: [30, "Cannot have more then 40 character for firstname"],
      min: [3, "Cannout have lesser then 3 character for firstname"],
    },
    lastName: {
      type: String,
      required: [true, "A user must have lastname"],
      max: [30, "Cannot have more then 40 character for lastname"],
      min: [3, "Cannout have lesser then 3 character for lastname"],
    },
    userName: {
      type: String,
      require: [true, "A unique username is require"],
      unique: true,
      max: [30, "Cannot have more then 40 character for username"],
      min: [3, "Cannout have lesser then 3 character for username"],
    },
    email: {
      type: String,
      require: [true, "Please provide an email address"],
      validator: {
        validate: validator.isEmail,
        message: "Please provide a valid email",
      },
      unique: true,
      lowercase: true,
    },
    profileImage: String,

    role: {
      type: String,
      enum: ["user", "guides", "admin"],
      default: "user",
    },
    password: {
      type: String,
      require: [true, "A password is require to create an account"],
      min: [6, "A password require 6 or more character"],
    },
    confirmPassword: {
      type: String,
      require: [true, "Please confirm the password"],
      min: [6, "A password require 6 or more character"],
      validate: {
        validator: function (el) {
          return this.password === el;
        },
        message: "Password didn't match",
      },
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
