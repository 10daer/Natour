/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/v1/users/update-password"
        : "/api/v1/users/update-me";

    const res = await axios({
      method: "PATCH",
      url,
      data
    });

    if (res.data.status === "success") {
      const responseData = res.data.data;
      if (data.get("photo")) {
        const userPhotoEl = document.querySelector(".form__user-photo");
        const navPhotoEl = document.querySelector(".nav__user-img");
        const navName = document.querySelector(".nav__el span");
        userPhotoEl.src = `/img/users/${responseData.photo}`;
        navPhotoEl.src = `/img/users/${responseData.photo}`;
        navName.textContent = responseData.name.split(" ")[0];
      }
      const name = document.getElementById("name");
      const email = document.getElementById("email");
      name.value = name.defaultValue = responseData.name;
      email.value = email.defaultValue = responseData.email;
      showAlert("success", `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    // console.log(err);
    showAlert("error", err.response.data.message);
  }
};

export const updateUser = async (data, id) => {
  try {
    const url = `/api/v1/users/${id}`;

    const res = await axios({
      method: "PATCH",
      url,
      data
    });

    if (res.data.status === "success") {
      showAlert("success", "User successfully updated");
      return res.data.data;
    }
  } catch (error) {
    showAlert("error", err.response.data.message);
  }
};

export const deleteUserData = async id => {
  try {
    const url = `/api/v1/users/${id}`;

    const res = await axios({
      method: "DELETE",
      url
    });

    if (res.data.status === "success") {
      showAlert("success", "User successfully deleted");
    }
  } catch (error) {
    showAlert("error", err.response.data.message);
  }
};
