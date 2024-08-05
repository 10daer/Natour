const express = require("express");

const Router = express.Router();
const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUserData
} = require("../Controller/userController");
const {
  signUp,
  logIn,
  protectedRoute,
  forgetPassword,
  resetPassword,
  updatePassword
} = require("../Controller/authController");

Router.post("/signup", signUp);
Router.post("/login", logIn);

Router.post("/forgetpassword", forgetPassword);
Router.patch("/resetpassword/:token", resetPassword);
Router.patch("/update-password", protectedRoute, updatePassword);
Router.patch("/update-my-data", protectedRoute, updateUserData);
Router.delete("/delete-me", protectedRoute, deleteUser);

Router.get("/", getAllUsers);
Router.get("/:id", getUser);

// Router.route("/")
//   .get(protectedRoute, getAllUsers)
//   .post(creatUser);

// Router.route("/:id")
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

module.exports = Router;
