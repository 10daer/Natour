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
  getMonthlyPlan
  // checkID,
  // checkTour
} = require("../Controller/tourController");
const { protectedRoute, restriction } = require("../Controller/authController");

// Router.param("id", checkID);

Router.route("/top-5-tours").get(aliasTopTours, getAllTours);

Router.route("/tour-stats").get(getTourStats);

Router.route("/monthly-plan/:year").get(getMonthlyPlan);

Router.route("/")
  .get(protectedRoute, getAllTours)
  .post(/*checkTour,*/ addTour);

Router.route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(protectedRoute, restriction("admin", "lead-guide"), deleteTour);

module.exports = Router;
