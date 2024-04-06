const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

// Sign up - Create new account
exports.signUp = catchAsync(async function (req, res, next) {
  // validate the requestBody remove the role if user send it
  // check if user already exist
  // create encrypts password
  // save password in the database
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
