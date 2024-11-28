/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const loadToursData = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: `/api/v1/tours`,
      withCredentials: true
    });

    if (res.data.status === "success") {
      return res.data.data.data;
    }
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const updateTour = async (data, id) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/tours/${id}`,
      data,
      withCredentials: true
    });

    if (res.data.status === "success") {
      showAlert("success", "Tour updated successfully");
    }
  } catch (err) {
    console.log(err.response.data.message);
    showAlert("error", err.response.data.message);
    throw new Error(err.response.data.message);
  }
};

export const createTour = async data => {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/tours`,
      data,
      withCredentials: true
    });

    if (res.data.status === "success") {
      showAlert("success", "New tour created successfully");
    }
  } catch (err) {
    console.log(err.response.data.message);
    showAlert("error", err.response.data.message);
    throw new Error(err.response.data.message);
  }
};
