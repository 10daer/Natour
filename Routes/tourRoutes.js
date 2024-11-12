const express = require("express");

const Router = express.Router();
const {
  getAllTours,
  getTour,
  updateTour,
  addTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getDistances,
  getToursWithin
  // checkID,
  // checkTour
} = require("../Controller/tourController");
const { protectedRoute, restriction } = require("../Controller/authController");
const reviewRouter = require("../Routes/reviewRoutes");

/* instead of having multiple codes    doing exactly the same thing 
 we can simply pass the review router for all the review route actions
*/
Router.route("/:tourId/reviews", reviewRouter);

Router.route("/top-5-tours").get(aliasTopTours, getAllTours);
Router.route("/tour-stats").get(getTourStats);
Router.route("/monthly-plan/:year").get(
  protectedRoute,
  restriction("admin", "lead-guide", "guide"),
  getMonthlyPlan
);

Router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(
  getToursWithin
);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi
Router.route("/distances/:latlng/unit/:unit").get(getDistances);
Router.route("/")
  .get(getAllTours)
  .post(protectedRoute, restriction("admin", "lead-guide"), addTour);

Router.route("/:id")
  .get(getTour)
  .patch(protectedRoute, restriction("admin", "lead-guide"), updateTour)
  .delete(protectedRoute, restriction("admin", "lead-guide"), deleteTour);

// ////////////////
// Old way of checking ID

// Router.param("id", checkID);

// POST /tour/tourId/reviews
// Router.route("/:tourId/reviews").post(
//   authController.protectedRoute,
//   authController.restriction("users"),
//   reviewController.createReviews
// );

// Router.route("/")
//   .get(protectedRoute, getAllTours)
//   .post(/*checkTour,*/ addTour);

module.exports = Router;
