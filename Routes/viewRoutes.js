const express = require("express");

const Router = express.Router();
const viewController = require("../Controller/viewController");
const authController = require("../Controller/authController");
const bookingController = require("../Controller/bookingController");

Router.get(
  "/me",
  authController.protectedRoute,
  viewController.getUserBookingsAndReviews,
  viewController.getAccount
);
Router.post(
  "/update-user-data",
  authController.protectedRoute,
  viewController.updateUserData
);

Router.get(
  "/booked-tours",
  bookingController.createBookingCheckout,
  authController.protectedRoute,
  viewController.getBookedToursPage
);

Router.use(authController.isLoggedIn);

Router.get("/", viewController.getHomePage);
Router.get("/forgot-password", viewController.getForgotPasswordPage);
Router.get("/resetpassword/:token", viewController.getResetPasswordPage);
Router.get("/all-tours", viewController.getOverviewPage);
Router.get("/tour/:slugId", viewController.getTourPage);
Router.get("/login", viewController.getLoginPage);
Router.get("/sign-up", viewController.getSignupPage);

module.exports = Router;
