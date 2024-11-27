/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";
const baseUrl = "http://127.0.0.1:8001/";

export const loadToursData = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: `${baseUrl}api/v1/tours`,
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
      url: `${baseUrl}api/v1/tours/${id}`,
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
      url: `${baseUrl}api/v1/tours`,
      data,
      withCredentials: true
    });

    if (res.data.status === "success") {
      showAlert("success", "Tour created successfully");
    }
  } catch (err) {
    console.log(err.response.data.message);
    showAlert("error", err.response.data.message);
    throw new Error(err.response.data.message);
  }
};
