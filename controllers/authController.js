const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const { upload } = require("../utils/uploadFiles");
const AppError = require("../utils/AppError");

const { uploadCloudinary } = require("../utils/uploadFiles");

// generate jsonwebtoken

const generateToken = function (userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendCookie = function (res, name, val, options) {
  let cookieOption = {};
  if (!options) {
    `  `;
    cookieOption.maxAge = 10000 * 60 * 10;
    cookieOption.httpOnly = true;
  }

  if (process.env.NODE_ENV === "production") {
    cookieOption.httpOnly = true;
  }
  res.cookie(name, val, cookieOption);
};

exports.uploadSingle = upload.single("profileImage");
// Sign up - Create new account
exports.signUp = catchAsync(async function (req, res, next) {
  // validate the requestBody remove the role if user send it
  console.log(req.body);
  let userData = req.body;
  if (!req.body.password || !req.body.confirmPassword)
    return next("Password is required");

  if (req.body.role) {
    userData.role = undefined;
  }
  // if user try to put the createdAt property

  // check if user already exist
  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) return next("User already exist using this email");

  // this things handled from the user model
  // create encrypts password
  // save password in the database

  // create the user document only
  const userDocument = new User(userData);

  // upload profile image

  const imageBuffer = req.file?.buffer;
  if (imageBuffer) {
    const result = await uploadCloudinary(
      imageBuffer,
      `profile/${userDocument.id}`
    );
    userDocument["profileImage"] = result.secure_url;
  }

  // creating new user to database
  const newUser = await userDocument.save({ validateBeforeSave: true });

  if (!newUser) return next("Something went wrong while creating user");
  newUser.password = undefined;

  console.log(newUser);

  const token = generateToken(newUser?._id);

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
  // const userForSession = {
  //   name: userData?.fullName,
  //   image: userData?.profileImage,
  //   email: userData?.email,
  //   role: userData?.role,
  // };
  // add the userData data  to req object req.userData = data

  // send response
  sendCookie(res, "jwt", token);

  res.status(200).json({
    status: "success",
    data: {
      token,
    },
  });
  // send response
});

// Change password

// Protect route middleware

exports.routeProtect = catchAsync(async function (req, res, next) {
  // check if the JWT is on the request Header or not
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    // check if it's on the cookie
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token || token === "null")
    return next(new AppError("Please login to get access", 401));
  // check if the JWT valid or not
  const validToken = jwt.verify(token, process.env.JWT_SECRET);

  // check the JWT expires or not / we don't need to verify it jwt does it for us
  if (!validToken)
    return next(new AppError("Invalid access token, please login again", 401));

  // check if user exist by the id of JWT
  const user = await User.findOne({ _id: validToken.id }).select(
    "-password +passwordChangedAt"
  );

  // check if user changed password after JWT was assigned by password updated time on the userDocument
  const isPassChanged = user.checkIsPasswordChanged(
    validToken.iat,
    user?.passwordChangedAt
  );
  if (isPassChanged)
    return next(new AppError("Invalid access token please login again", 401));

  if (!user) return next(new AppError("No user found with your token", 403));
  // finally add the user to req.user
  req.user = user;
  req.userRole = user.role;
  // send response
  next();
});

// Role base access - Ristrict
exports.authorise = function (...roles) {
  return function (req, res, next) {
    console.log(req.userRole);
    if (!roles.includes(req.userRole)) {
      return next(
        new AppError("You are not authorised to perform this action.", 403)
      );
    }
    console.log("--Authorised--");
    next();
  };
};

exports.updateProfile = catchAsync(async function (req, res, next) {
  // filter incoming data
  const filterinput = function (currentData, ...disableProps) {
    const updatedData = {};

    // getting the key of the object
    const dataEntries = Object.keys(currentData);

    // if tries to change the password
    if (dataEntries.includes("password"))
      return next(new AppError("You cannot change  password here.", 400));
    // if tries to change the username
    if (dataEntries.includes("userName"))
      return next(new AppError("You cannot change  your username.", 400));

    dataEntries.map((item) => {
      if (!disableProps.includes(item)) {
        updatedData[item] = currentData[item];
      }
    });
    // returning the filter data
    return updatedData;
  };

  let updatedData = filterinput(
    req.body,
    "role",
    "userName",
    "isActive",
    "password",
    "createdAt",
    "passwordChangedAt"
  );

  // getting the image file
  const imageBuffer = req.file?.buffer;

  // uploading the image and adding the the link

  if (imageBuffer) {
    const result = await uploadCloudinary(
      imageBuffer,
      `profile/${req.user?.id}`
    );
    updatedData["profileImage"] = result.secure_url;
  }

  // change the data in the database

  const userData = await User.findByIdAndUpdate(req.user?.id, updatedData, {
    new: true,
  }).select("-password -role -isActive");

  if (!userData)
    return next(
      new AppError("Something went wrong while updating profile", 400)
    );

  res.status(200).json({
    status: "success",
    message: "Profile updated",
    data: {
      userData,
    },
  });
});

exports.getMe = catchAsync(async function (req, res, next) {
  let id;
  id = req.user?.id;
  const user = await User.findById(id).select("-password -__v");
  if (!user) return next(new AppError("No user found ", 404));

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// logout from server

// change password
exports.changePassword = catchAsync(async function (req, res, next) {
  const data = req.body;
  if (!data?.currentPassword)
    return next(new AppError("Provide the current password to verify", 403));

  if (!data?.newPassword)
    return next(new AppError("Give a new password to change with", 403));
  if (!data?.confirmPassword)
    return next(new AppError("Confirm both of the password", 403));

  // check if current password is correct
  const userId = req.user?.id;
  const currentUser = await User.findById(userId);
  const isPasswordCorrect = await currentUser.checkPassword(
    currentUser.password,
    data.currentPassword
  );

  if (!isPasswordCorrect)
    return next(
      new AppError(
        "Current password didn't match. please provide correct password to begin",
        403
      )
    );

  // if everything goes well changing the password
  currentUser.password = data.newPassword;
  currentUser.confirmPassword = data.confirmPassword;
  currentUser.passwordChangedAt = Date.now() - 10000;
  console.log(Date.now() / 1000);
  // set the newPassword
  const user = await currentUser.save({ validateBeforeSave: true });

  if (!user)
    return next(
      new AppError("Something went wrong while changing the password", 500)
    );

  const token = generateToken(user?._id);
  // send response
  sendCookie(res, "jwt", token);

  // return the response
  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
    data: {
      token,
    },
  });

  // logout the user to login again
});

// reset password

// sign in using google
exports.signInWithGoogle = catchAsync(async function (req, res, next) {
  // creating username using recurtion function
  const generateUserName = async function (firstName) {
    // username should start with the firstname
    const randomNumber = Math.floor(Math.random() * (10000 - 10 + 1)) + 10;
    const uniqueUserName = `${firstName}${randomNumber.toString()}`;
    const userExist = await User.findOne({ userName: uniqueUserName });

    // if user found with the generated userName
    if (userExist) {
      generateUserName(firstName);
    } else {
      console.log("non-recursive");
    }
    // check if already username exist or not
  };

  const createGoogleUser = async function (userInfo) {
    const userName = await generateUserName(userInfo.fullName.split(" ")[0]);
    userInfo.userName = userName;
    const newUser = await User.create(userInfo);
    const token = generateToken(newUser.id);
    res.status(200).json({
      status: "success",
      message: "User created successfully",
      data: {
        token,
        user: newUser,
      },
    });
  };

  // sending access token for existing user
  const loggingGoogleUser = function (userInfo) {
    const token = generateToken(userInfo.id);
    res.status(200).json({
      status: "success",
      data: {
        token,
      },
    });
  };
  // check if user already exist
  const user = await User.findOne({ email: req.body.email });

  // if not create new user with provided information and sending token
  if (!user) {
    createGoogleUser(req.body);
  } else {
    // if user exist loggin him/her in by sending access token
    loggingGoogleUser(user);
  }
});
