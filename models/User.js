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
      unique: true,
      max: [30, "Cannot have more then 40 character for username"],
      min: [3, "Cannout have lesser then 3 character for username"],
    },
    email: {
      type: String,
      require: [true, "Please provide an email address"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide valid email address"],
    },
    profileImage: String,

    role: {
      type: String,
      enum: ["user", "guides", "admin"],
      default: "user",
    },
    password: {
      type: String,
      min: [6, "A password require 6 or more character"],
    },
    confirmPassword: {
      type: String,
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
