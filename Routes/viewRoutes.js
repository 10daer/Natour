const express = require("express");

const Router = express.Router();
const viewController = require("../Controller/viewController");
const authController = require("../Controller/authController");

Router.get("/me", authController.protectedRoute, viewController.getAccount);
Router.post(
  "/update-user-data",
  authController.protectedRoute,
  viewController.updateUserData
);

Router.use(authController.isLoggedIn);

Router.get("/", viewController.getOverviewPage);
Router.get("/tour/:slugId", viewController.getTourPage);
Router.get("/login", viewController.getLoginPage);

module.exports = Router;
