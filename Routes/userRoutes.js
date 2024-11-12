const express = require("express");

const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  createUser,
  updateMe,
  deleteMe,
  getMe
} = require("../Controller/userController");
const {
  signUp,
  logIn,
  protectedRoute,
  forgotPassword,
  resetPassword,
  updatePassword,
  restriction
} = require("../Controller/authController");

const Router = express.Router();

Router.post("/signup", signUp);
Router.post("/login", logIn);
Router.post("/forgotpassword", forgotPassword);
Router.patch("/resetpassword/:token", resetPassword);

// Protect all routes after this middleware only for the authorized
Router.use(protectedRoute);

Router.patch("/update-password", updatePassword);
Router.get("/me", getMe, getUser);
Router.patch("/update-me", updateMe);
Router.delete("/delete-me", deleteMe);

Router.use(restriction("admin"));

Router.route("/")
  .get(getAllUsers)
  .post(createUser);
Router.route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// Router.route("/")
//   .get(protectedRoute, getAllUsers)
//   .post(creatUser);

// Router.route("/:id")
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

module.exports = Router;
