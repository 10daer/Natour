// const catchAsync = require("../Utils/catchAsync");
const Review = require("../Model/reviewModel");
const Booking = require("../Model/bookingModel");
const catchAsync = require("../Utils/catchAsync");
const factory = require("./handlerFactory");
const { AppError } = require("../Utils/appErrors");

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.checkUserBookings = catchAsync(async (req, res, next) => {
  const booking = await Booking.find({
    tour: req.body.tour,
    user: req.user._id
  });
  if (!booking) {
    return new AppError(
      "You can only review a tour after booking the tour",
      403
    );
  }
  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: "success",
//     results: reviews.length,
//     data: {
//       reviews
//     }
//   });
// });

// exports.createReviews = catchAsync(async (req, res, next) => {
//   // Allow nested route
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.Id;

//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: "success",
//     data: {
//       newReview
//     }
//   });
// });
