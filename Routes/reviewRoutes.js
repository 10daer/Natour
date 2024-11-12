const express = require("express");
const {
  getAllReviews,
  setTourUserIds,
  getReview,
  createReview,
  updateReview,
  deleteReview
} = require("../Controller/reviewController");
const { protectedRoute, restriction } = require("../Controller/authController");

const router = express.Router({ mergeParams: true });

router.use(protectedRoute);
// Because middleware are operated sequentially, every route under this are protected

router
  .route("/")
  .get(getAllReviews)
  .post(restriction("user"), setTourUserIds, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(restriction("user", "admin"), updateReview)
  .delete(restriction("user", "admin"), deleteReview);

// router
//   .route("/")
//   .get(getAllReviews)
//   .post(
//     protectedRoute,
//     restriction("users"),
//     createReviews
//   );

// router
//   .route("/")
//   .get(getAllReviews)
//   .post(
//     restriction("user"),
//     setTourUserIds,
//     createReview
//   );

// router
//   .route("/:id")
//   .get(getReview)
//   .patch(
//     restriction("user", "admin"),
//     updateReview
//   )
//   .delete(
//     restriction("user", "admin"),
//     deleteReview
//   );

module.exports = router;
