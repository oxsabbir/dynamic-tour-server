const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

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
  if (userExist) next("User already exist using this email");

  // this things handled from the user model
  // create encrypts password
  // save password in the database

  // create the user
  const newUser = await User.create(req.body);

  res.status(200).json({
    status: "success",
    message: "User created successfully",
    data: {
      user: newUser,
    },
  });
  // generate JSONWEBTOKEN
  // send the response
});

// Login - access account

exports.login = catchAsync(async function (req, res, next) {
  // validate user input
  // check if that user exist in the database
  // compare the password using instance method of the document
  // generate JSONWEBTOKEN
  // add the user data  to req object req.user = data
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
