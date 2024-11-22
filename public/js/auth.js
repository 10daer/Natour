/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";
const baseUrl = "http://127.0.0.1:8001/";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: `${baseUrl}api/v1/users/login`,
      data: {
        email,
        password
      },
      withCredentials: true
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => {
        location.assign("/me");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
    throw new Error(err.response.data.message);
  }
};

export const fetchAll = async (password, email, route) => {
  try {
    await axios({
      method: "POST",
      url: `${baseUrl}api/v1/users/login`,
      data: {
        email,
        password
      },
      withCredentials: true
    });

    const res = await axios({
      method: "GET",
      url: `${baseUrl}api/v1/${route}`,
      withCredentials: true
    });
    if (res.data.status === "success") {
      showAlert("success", "Password Verified!");
    }
    return res.data.data;
  } catch (err) {
    showAlert("error", err.response.data.message);
    throw new Error(err.response.data.message);
  }
};

export const forgetPassword = async email => {
  try {
    const res = await axios({
      method: "POST",
      url: `${baseUrl}api/v1/users/forgotpassword`,
      data: {
        email
      },
      withCredentials: true
    });

    if (res.data.status === "success") {
      showAlert("success", "Reset link successfully sent to your mail!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const resetPassword = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `${baseUrl}api/v1/users/resetpassword/${token}`,
      data: {
        password,
        passwordConfirm
      },
      withCredentials: true
    });

    if (res.data.status === "success") {
      showAlert(
        "success",
        "Password successfully reset. Login with your new password"
      );
      window.setTimeout(() => {
        location.assign("/login");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const signup = async (name, email, password, passwordConfirm, role) => {
  try {
    const newClient = {
      name,
      email,
      password,
      passwordConfirm,
      passwordCreatedAt: Date.now(),
      role
    };
    const res = await axios({
      method: "POST",
      url: `${baseUrl}api/v1/users/signup`,
      data: newClient,
      withCredentials: true
    });

    if (res.data.status === "success") {
      showAlert("success", "Account created successfully!");
      window.setTimeout(() => {
        location.assign("/me");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: `${baseUrl}api/v1/users/logout`
    });
    if ((res.data.status = "success")) location.assign("/");
  } catch (err) {
    console.log(err);
    showAlert("error", "Error logging out! Try again.");
  }
};
