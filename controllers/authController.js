const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const upload = require("../utils/uploadFiles");
const AppError = require("../utils/AppError");

// generate jsonwebtoken

const generateToken = function (userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendCookie = function (res, name, val, options) {
  let cookieOption = {};
  if (!options) {
    cookieOption.maxAge = 10000 * 60 * 10;
  }

  if (process.env.NODE_ENV === "production") {
    cookieOption.httpOnly = true;
  }
  res.cookie(name, val, cookieOption);
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

  sendCookie(res, "jwt", token);
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
  console.log(req.body);
  if (!req.body.emailOrUsername)
    return next("Please provide email or username");
  if (!req.body.password) return next("Please provide a password");
  // check if that user exist in the database
  const userData = await User.findOne({
    $or: [
      { email: req.body.emailOrUsername },
      { userName: req.body.emailOrUsername },
    ],
  });
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

  // send response
  sendCookie(res, "jwt", token);
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
  let token;

  if (req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    // check if it's on the cookie
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return next(new AppError("Please login to get access", 401));
  }
  // check if the JWT valid or not

  // check the JWT expires or not
  const validToken = jwt.verify(token, process.env.JWT_SECRET);

  if (!validToken)
    return next(new AppError("Invalid access token, please login again", 401));

  // check if user exist by the id of JWT
  const user = await User.findOne({ _id: validToken.id }).select(
    "-password -__v "
  );
  if (!user) return next(new AppError("No user found with your token", 403));
  // check if user changed password after JWT was assigned by password updated time on the userDocument
  // finally add the user to req.user
  req.user = user;
  req.userRole = user.role;
  // send response
  next();
});

// Role base access - Ristrict
exports.authorise = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.userRole)) {
      return next(
        new AppError("You are not authorised to perform this action.", 403)
      );
    }
    console.log("--Authorised--");
    next();
  };
};

exports.uploadSingle = upload.array("profileImage");

exports.updateProfile = catchAsync(async function (req, res, next) {
  console.log(req.body);
  console.log(req.file);
  console.log(req.files);

  // now we got the file

  // need cloudinary to store the file
  res.send("file uploaded");
});
