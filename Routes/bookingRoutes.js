const express = require("express");
const bookingController = require("../Controller/bookingController");
const authController = require("../Controller/authController");

const router = express.Router();

router.use(authController.protectedRoute);

router.get(
  "/checkout-session/:tourId",
  authController.restriction("user"),
  bookingController.getCheckoutSession
);

router.use(authController.restriction("admin", "lead-guide"));

router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
