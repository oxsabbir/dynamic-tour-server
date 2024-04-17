const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

// generate jsonwebtoken

const generateToken = function (userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Sign up - Create new account
exports.signUp = catchAsync(async function (req, res, next) {
  // validate the requestBody remove the role if user send it
  if (req.body.role) {
    req.body.role = undefined;
  }
  // if user try to put the createdAt property
  if (req.body.createdAt) {
    req.body.createdAt = Date.now();
  }
  // check if user already exist
  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) return next("User already exist using this email");

  // this things handled from the user model
  // create encrypts password
  // save password in the database

  // create the user
  const newUser = await User.create(req.body);
  if (!newUser) return next("Something went wrong while creating user");
  const token = generateToken();

  res.status(200).json({
    status: "success",
    message: "User created successfully",
    data: {
      token,
      user: newUser,
    },
  });
  // generate JSONWEBTOKEN
  // send the response
});

// Login - access account

exports.login = catchAsync(async function (req, res, next) {
  // validate user input
  if (!req.body.email) return next("Please provide email or username");
  if (!req.body.password) return next("Please provide a password");
  // check if that user exist in the database
  const userData = await User.findOne({ email: req.body.email });
  if (!userData) return next("No user found with provided information");
  // compare the password using instance method of the document
  const isCorrect =
    userData &&
    (await userData.checkPassword(userData.password, req.body.password));
  if (!isCorrect)
    return next("Please provide a valid email and password combination");
  // generate JSONWEBTOKEN
  const token = generateToken(userData._id);
  // add the userData data  to req object req.userData = data
  res.status(200).json({
    status: "success",
    data: {
      token,
      userData,
    },
  });
  // send response
});

// Change password

// Protect route middleware

exports.routeProtect = catchAsync(async function (req, res, next) {
  // check if the JWT is on the request Header or not
  // check if it's on the cookie
  // check if user exit by the id of JWT
  // check the JWT expires or not
  // check if user changed password after JWT was assigned by password updated time on the userDocument
  // check if the JWT valid or not
  // finally add the user to req.user
  // send response
});

// Role base access - Ristrict
