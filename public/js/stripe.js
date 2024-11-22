/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const bookTour = async tourId => {
  try {
    console.log(tourId);
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:8001/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + charge credit card
    const stripe = Stripe(
      "pk_test_51QMKfwB20xXhBbzuEcHEWHsLbROrLvYEaZJvlJ4wHneplMS6KD6EighHzkfHN1e1albNs3n5A139XFdOr16Zpfl800kHWvPzuH"
    );
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert("error", "Unable to book this tour at this moment");
  }
};
