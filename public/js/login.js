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
        location.assign("/");
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
    if ((res.data.status = "success")) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert("error", "Error logging out! Try again.");
  }
};
