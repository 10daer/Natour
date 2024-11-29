const Tour = require("../Model/tourModel");
const Booking = require("../Model/bookingModel");
const Review = require("../Model/reviewModel");
const User = require("../Model/userModel");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appErrors");

exports.getUserBookingsAndReviews = catchAsync(async (req, res, next) => {
  const userId = req.user?._id || res.locals.user._id;
  if (req.user?.role === "user") {
    res.locals.userBookings = await Booking.find({ user: userId });
    res.locals.userReviews = await Review.find({ user: userId });
  } else if (req.user?.role === "guide" || req.user?.role === "lead-guide") {
    const tourIds = await Tour.find({ guides: userId })
      .select("_id")
      .lean();
    const tourIdArray = tourIds.map(tour => tour._id);
    const bookedTours = await Booking.find({
      tour: { $in: tourIdArray }
    }).populate("tour");

    res.locals.tours = bookedTours;
  } else if (req.user?.role === "admin") {
    res.locals.tours = await Tour.find().populate({
      path: "guides",
      fields: "name"
    });
    res.locals.guides = await User.find({
      $or: [{ role: "guide" }, { role: "lead-guide" }]
    });
  }
  next();
});

exports.getHomePage = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  const topTours = await Tour.find({})
    .limit(3)
    .sort("-ratingsAverage price");
  const reviews = await Review.find({})
    .limit(7)
    .sort("-rating");
  res.status(200).render("home", { title: "Welcome", topTours, reviews });
});

exports.getForgotPasswordPage = (req, res) => {
  res.status(200).render("forgotpassword", { title: "Reset Your Password" });
};

exports.getVerificationPage = (req, res) => {
  const { user } = req.query;
  const decodedUserEmail = decodeURIComponent(user);
  res.status(200).render("verificationPage", {
    title: "Verify Your Account",
    email: decodedUserEmail
  });
};

exports.getResetPasswordPage = (req, res) => {
  const { token } = req.params;
  res
    .status(200)
    .render("resetpassword", { title: "Create New Password", token });
};

exports.getOverviewPage = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  if (!tours || !tours.length) {
    return next(
      new AppError(
        "There is no tour available at this moment. Please check back later",
        404
      )
    );
  }
  res.status(200).render("overview", { title: "All Tours", tours });
});

exports.getTourPage = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slugId }).populate({
    path: "reviews",
    fields: "review rating user"
  });

  if (!tour) {
    return next(new AppError("There is no tour with that name.", 404));
  }

  const user = req.user || res.locals.user;

  if (user?.role && user?.role === "user") {
    const booking = await Booking.find({ user: user._id, tour: tour.id });
    const review = await Review.find({ tour: tour.id, user: user._id });
    res.locals.hasBookedTour = Boolean(booking.length);
    res.locals.hasReviewedTour = Boolean(review.length);
  }

  res.status(200).render("tour", { title: tour.name, tour });
});

exports.getLoginPage = (req, res) => {
  res.status(200).render("login", { title: "Login" });
};

exports.getSignupPage = (req, res) => {
  res.status(200).render("signup", { title: "Create an account" });
};

exports.getAccount = catchAsync(async (req, res) => {
  res.status(200).render("account", {
    title: "Your account"
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render("account", {
    title: "Your account",
    user: updatedUser
  });
});
