const crypto = require("crypto");
const { promisify } = require("util");
const { sign, verify } = require("jsonwebtoken");
const Users = require("../Model/userModel");
const catchAsync = require("../Utils/catchAsync");
const { AppError } = require("../Utils/appErrors");
const Email = require("../Utils/sendEmail");

const signToken = id =>
  sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_TOKEN_EXPIRATION
  });

const responseWithToken = (user, req, res, statusCode) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 3600 * 1000
    ),
    httpOnly: true,
    path: "/",
    secure: req.secure || req.headers["x-forwarded-proto"] === "https"
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    body: user
  });
};

exports.verifyAccount = catchAsync(async (req, res, next) => {
  const verificationToken = req.body.verificationCode;
  const encryptedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  const user = await Users.findOne({
    VerificationToken: encryptedToken,
    VerificationTokenExpiryDate: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError("Invalid or expired verification token.", 400));
  }

  user.isVerified = true;
  user.VerificationToken = undefined;
  user.VerificationTokenExpiryDate = undefined;
  await user.save({ validateBeforeSave: false });

  responseWithToken(user, req, res, 201);
});

exports.generateVerificationToken = catchAsync(async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("Provided User does not exist", 404));
  }

  if (user.isVerified) {
    return res
      .status(400)
      .json({ status: "error", message: "User is already verified" });
  }

  if (user.VerificationToken) {
    user.VerificationToken = undefined;
    user.VerificationTokenExpiryDate = undefined;
    await user.save({ validateBeforeSave: false });
  }

  try {
    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });

    console.log(verificationToken);
    // await new Email(user, verificationToken).sendAccountVerification();
    res.status(200).json({
      status: "success",
      data: user.email,
      message:
        "Your account verification code  has been successfully sent to your mail"
    });
  } catch (error) {
    user.VerificationToken = undefined;
    user.VerificationTokenExpiryDate = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "An unexpected error occurred while sending the account verification email. Please try again later.",
        500
      )
    );
  }
});

exports.signUp = catchAsync(async (req, res, next) => {
  const newUserObj = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordCreatedAt: req.body.passwordCreatedAt,
    accountCreatedAt: req.body.accountCreatedAt,
    role: req.body.role
  };
  const newUser = await Users.create(newUserObj);
  const url = `${req.protocol}://${req.get("host")}/me`;
  // await new Email(newUser, url).sendWelcome();

  next();
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await Users.findOne({ email }).select("+password");

  if (!user || !(await user.verifyPasswords(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (!user.isVerified) {
    return next(
      new AppError("User has not been verified their account", 403, {
        accountIsUnverified: true
      })
    );
  }

  responseWithToken(user, req, res, 200);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "logged-out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: "success" });
};

exports.protectedRoute = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    `${req.headers.authorization}`.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not currently logged in. Please log in", 401)
    );
  }

  const decoded = await promisify(verify)(token, process.env.JWT_SECRET_KEY);
  const currentUser = await Users.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError("The user with this token does not exist", 401));
  }

  if (currentUser.verifyPasswordChange(decoded.iat)) {
    return next(
      new AppError("User recently changed password. Please log in", 401)
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET_KEY
      );

      // 2) Check if user still exists
      const currentUser = await Users.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.verifyPasswordChange(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restriction = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    next(
      new AppError("You are restricted to from performing this action", 403)
    );

  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("Provided User does not exist", 404));
  }

  try {
    const resetToken = user.generateToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/resetpassword/${resetToken}`;

    console.log(resetUrl);
    // await new Email(user, resetUrl).sendPasswordReset();
    res.status(200).json({
      status: "success",
      message: "The reset link has been successfully sent to your mail"
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordTokenExpiryDate = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "An unexpected error occurred while sending the password reset email. Please try again later.",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.token;
  const encryptedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await Users.findOne({
    passwordResetToken: encryptedToken,
    passwordTokenExpiryDate: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError("Invalid or expired reset token.", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordTokenExpiryDate = undefined;
  await user.save();

  // responseWithToken(user,req, res, 200);

  res.status(200).json({
    status: "success",
    message: "Your password has been reset successfully."
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await Users.findById(req.user.id).select("+password");

  if (!(await user.verifyPasswords(req.body.currentPassword, user.password))) {
    return next(new AppError("Incorrect password. Please try again", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  responseWithToken(user, req, res, 200);
});
