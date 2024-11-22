/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";
const baseUrl = "http://127.0.0.1:8001/";

export const addReview = async (review, rating, tour) => {
  try {
    const res = await axios({
      method: "POST",
      url: `${baseUrl}api/v1/reviews`,
      data: {
        review,
        rating,
        tour
      },
      withCredentials: true
    });

    if (res.data.status === "success") {
      showAlert("success", "Your review has been added successfully!");
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};

export const deleteReview = async id => {
  try {
    const res = await axios({
      method: "DELETE",
      url: `${baseUrl}api/v1/reviews/${id}`,
      withCredentials: true
    });

    const reviewCards = document.querySelectorAll(".review");
    reviewCards.forEach(el => {
      if (el.dataset.id === id) el.closest("li").remove();
    });
    showAlert("success", "Your review has been deleted!");
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};
