const Tour = require("../Model/tourModel");
const User = require("../Model/userModel");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appErrors");

exports.getOverviewPage = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
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
  res.status(200).render("tour", { title: tour.name, tour });
});

exports.getLoginPage = (req, res) => {
  res.status(200).render("login", { title: "Login" });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account"
  });
};

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
