const express = require("express");

const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  createUser,
  updateMe,
  cleanUpdateFields,
  resizeUserPhoto,
  uploadUserPhoto,
  deleteMe,
  getMe
} = require("../Controller/userController");
const {
  signUp,
  logIn,
  logout,
  protectedRoute,
  forgotPassword,
  resetPassword,
  updatePassword,
  restriction
} = require("../Controller/authController");

const Router = express.Router();

Router.post("/signup", signUp);
Router.post("/login", logIn);
Router.get("/logout", logout);
Router.post("/forgotpassword", forgotPassword);
Router.patch("/resetpassword/:token", resetPassword);

// Protect all routes after this middleware only for the authorized
Router.use(protectedRoute);

Router.patch("/update-password", updatePassword);
Router.get("/me", getMe, getUser);
Router.patch(
  "/update-me",
  uploadUserPhoto,
  resizeUserPhoto,
  cleanUpdateFields,
  updateMe
);
Router.delete("/delete-me", deleteMe);

Router.use(restriction("admin"));

Router.route("/")
  .get(getAllUsers)
  .post(createUser);
Router.route("/:id")
  .get(getUser)
  .patch(uploadUserPhoto, resizeUserPhoto, cleanUpdateFields, updateUser)
  .delete(deleteUser);

// Router.route("/")
//   .get(protectedRoute, getAllUsers)
//   .post(creatUser);

// Router.route("/:id")
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

module.exports = Router;
