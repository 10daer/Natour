/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

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

    showAlert("success", "User successfully deleted");
  } catch (error) {
    showAlert("error", err.response.data.message);
  }
};
