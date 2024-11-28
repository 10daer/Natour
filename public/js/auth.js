/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/users/login`,
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
    if (err.response.data.error.accountIsUnverified) {
      const queryString = `?user=${encodeURIComponent(email)}`;
      window.setTimeout(() => {
        location.assign(`/verify-account${queryString}`);
      }, 1500);
    }
  }
};

export const fetchAll = async (password, email, route) => {
  try {
    await axios({
      method: "POST",
      url: `/api/v1/users/login`,
      data: {
        email,
        password
      },
      withCredentials: true
    });

    const res = await axios({
      method: "GET",
      url: `/api/v1/${route}`,
      withCredentials: true
    });
    if (res.data.status === "success") {
      showAlert("success", "Password Verified!");
    }
    return res.data.data;
  } catch (err) {
    console.log(err.response.data.message);
    showAlert("error", err.response.data.message);
    throw new Error(err.response.data.message);
  }
};

export const forgetPassword = async email => {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/users/forgotpassword`,
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
      url: `/api/v1/users/resetpassword/${token}`,
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
    const newUser = {
      name,
      email,
      password,
      passwordConfirm,
      passwordCreatedAt: Date.now(),
      accountCreatedAt: Date.now(),
      role
    };
    const res = await axios({
      method: "POST",
      url: `/api/v1/users/signup`,
      data: newUser,
      withCredentials: true
    });

    if (res.data.status === "success") {
      const queryString = `?user=${encodeURIComponent(email)}`;
      showAlert("success", "Account created successfully!");
      window.setTimeout(() => {
        location.assign(`/verify-account${queryString}`);
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const regenerateToken = async data => {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/users/generatecode`,
      data: { email: data },
      withCredentials: true
    });

    if (res.data.status === "success") {
      showAlert("success", "Verification code sent successfully!");
    }
  } catch (err) {
    console.log(err.response.data);
    showAlert("error", err.response.data.message);
  }
};

export const verifyAccount = async data => {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/users/verifyaccount`,
      data: { verificationCode: data },
      withCredentials: true
    });
    if (res.data.status === "success") {
      showAlert("success", "Account verified successfully!");
      window.setTimeout(() => {
        location.assign("/me");
      }, 1000);
    }
  } catch (err) {
    console.log(err.response.data);
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: `/api/v1/users/logout`
    });
    if ((res.data.status = "success")) location.assign("/");
  } catch (err) {
    console.log(err);
    showAlert("error", "Error logging out! Try again.");
  }
};
