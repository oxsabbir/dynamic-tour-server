const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "A user must have fullname"],
      max: [25, "Cannot have more then 50 character for fullname"],
      min: [3, "Cannout have lesser then 3 character for firstname"],
    },

    userName: {
      type: String,
      require: [true, "A unique username is require"],
      unique: true,
      max: [25, "Cannot have more then 25 character for username"],
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
      enum: ["user", "guide", "admin"],
      default: "user",
    },
    password: {
      type: String,
      min: [8, "A password require 6 or more character"],
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    booking: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Booking",
      },
    ],
    confirmPassword: {
      type: String,
      // require: [true, "Please confirm the password"],
      min: [8, "A password require 8 or more character"],
      validate: {
        validator: function (el) {
          return this.password === el;
        },
        message: "Password didn't match",
      },
    },
    readyForGuide: {
      type: Boolean,
      default: false,
    },
    completedTour: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Tour",
      },
    ],

    ratingAverage: Number,
    reviews: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Review",
        select: false,
      },
    ],
    price: {
      type: Number,
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

// creating the fullname using the virtual Properties
// userSchema.virtual("fullName").get(function () {
//   return this.firstName + " " + this.lastName;
// });

// checking if user password is changed or not
userSchema.methods.checkIsPasswordChanged = function (
  jwtTimeStamp,
  changedTime
) {
  const changeTimeStamp = Math.round(new Date(changedTime).getTime() / 1000);
  // if the changeTimeStamp is greater then jwtTimeStamp then . is return true that mean password changed after login token is not valid anymore
  return changeTimeStamp > jwtTimeStamp;
};

// using the instance method to check the password if it's correct or not
userSchema.methods.checkPassword = async function (
  storedPassword,
  providedPassword
) {
  const isCorrect = await bcrypt.compare(providedPassword, storedPassword);
  return isCorrect;
};

// hashing password before saving using document middleware
userSchema.pre("save", async function (next) {
  if (!this.password) next();
  // checking if the password has been modified before
  if (!this.isModified()) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
