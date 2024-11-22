/* eslint-disable */
import { showAlert } from "./alerts";
import {
  forgetPassword,
  login,
  logout,
  resetPassword,
  signup,
  fetchAll
} from "./auth";
import { displayMap } from "./leaflet";
import { addReview, deleteReview } from "./review";
import { updateUser, deleteUserData } from "./user";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";
import {
  adminContainerContent,
  ReviewDetailCard,
  userDetailCard,
  UserManagementForm
} from "./html";

// DOM ELEMENTS
const leafletMap = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const SignupForm = document.querySelector(".form--signup");
const logOutBtn = document.querySelectorAll(".nav__el--logout");
const forgotPasswordForm = document.querySelector(".form--forgot-password");
const resetPasswordForm = document.querySelector(".form--reset-password");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");
const account = document.querySelector(".user-view");
const navLists = document.querySelectorAll(".side-nav li");
const navMenu = document.querySelector(".user-view__menu");
const photo = document.getElementById("photo");
const bookBtn = document.getElementById("book-tour");
const submitReviewBtn = document.querySelector(".create-review-btn");
const reviewStars = document.querySelectorAll(".popup-reviews__star");
const reviewRating = document.querySelector(".popup-reviews__rating");
const tourSection = document.querySelector(".tour-section");
const deleteReviewBtn = document.querySelectorAll(".delete__reviews");
const usersAdminForm = document.querySelector(".admin-section--0");
const reviewAdminForm = document.querySelector(".admin-section--1");
const bookingAdminForm = document.querySelector(".admin-section--2");

let addNewUserForm;

// DELEGATION
if (leafletMap) {
  const locations = JSON.parse(leafletMap.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });

if (resetPasswordForm)
  resetPasswordForm.addEventListener("submit", e => {
    e.preventDefault();
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    const password = document.getElementById("password").value;
    const token = document.querySelector("input[name=token]").value;
    resetPassword(password, passwordConfirm, token);
  });

if (forgotPasswordForm)
  forgotPasswordForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    forgetPassword(email);
  });

if (SignupForm)
  SignupForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const name = document.getElementById("name").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    const roleIndex = document.querySelector("input[type=radio]:checked").value;
    const role = ["user", "admin", "guide", "lead-guide"][+roleIndex];
    signup(name, email, password, passwordConfirm, role);
  });

if (logOutBtn && logOutBtn.length > 0)
  logOutBtn.forEach(el => el.addEventListener("click", logout));

let photoNewlySelected = false;

if (photo)
  photo.addEventListener("change", () => {
    photoNewlySelected = true;
  });

if (userDataForm)
  userDataForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = userDataForm.querySelector("#name");
    const email = userDataForm.querySelector("#email");
    const formIsNotChanged =
      name.value === name.defaultValue &&
      email.value === email.defaultValue &&
      (!photoNewlySelected || photo.files.length === 0);

    if (formIsNotChanged) {
      return showAlert("error", "You haven't made any change!");
    } else {
      const form = new FormData();
      if (name.value !== name.defaultValue) form.append("name", name.value);
      if (email.value !== email.defaultValue) form.append("email", email.value);
      if (photoNewlySelected && photo.files.length > 0)
        form.append("photo", photo.files[0]);

      await updateSettings(form, "data");
      photoNewlySelected = false;
    }
  });

if (userPasswordForm)
  userPasswordForm.addEventListener("submit", async e => {
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating...";

    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );

    document.querySelector(".btn--save-password").textContent = "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });

if (account) {
  navLists.forEach(el => {
    el.addEventListener("click", function(e) {
      el.classList.add("side-nav--active");
      if (el !== e.target) el.classList.remove("side-nav--active");
    });
  });

  navMenu.addEventListener("click", function(e) {
    const clicked = e.target.closest(".side-nav-list");
    const sections = document.querySelectorAll(".user-view__content-box");

    // Guard clause
    if (!clicked) return;

    // Remove active classes
    navLists.forEach(nav => nav.classList.remove("side-nav--active"));
    sections.forEach(section => {
      section.style.display = "block";
      if (clicked.dataset.nav > section.dataset.section)
        section.style.display = "none";
    });

    // Add active classes
    clicked.classList.add("side-nav--active");
  });
}

if (bookBtn)
  bookBtn.addEventListener("click", e => {
    console.log(e.target);
    bookBtn.textContent = "Processing...";
    const tourId = tourSection.dataset.tourid;
    bookTour(tourId);
  });

if (tourSection && submitReviewBtn)
  submitReviewBtn.addEventListener("click", async e => {
    e.preventDefault();
    const review = document.querySelector("textarea").value;
    const rating = Number(reviewRating.dataset.rating);
    const tour = tourSection.dataset.tourid;

    await addReview(review, rating, tour);
  });

if (reviewRating)
  reviewStars.forEach(el =>
    el.addEventListener("click", function(e) {
      // Toggle active classes
      reviewStars.forEach(el => {
        el.classList.remove("popup-reviews__star--active");

        el.dataset.index <=
          e.target.closest(".popup-reviews__star").dataset.index &&
          el.classList.add("popup-reviews__star--active");
      });
      reviewRating.dataset.rating = e.target.closest(
        ".popup-reviews__star"
      ).dataset.index;
    })
  );

if (deleteReviewBtn)
  deleteReviewBtn.forEach(el =>
    el.addEventListener("click", function(e) {
      const reviewId = e.target.closest(".review").dataset.id;

      deleteReview(reviewId);
    })
  );

if (usersAdminForm)
  usersAdminForm.addEventListener(
    "submit",
    manageUserAction.bind(usersAdminForm)
  );

if (reviewAdminForm)
  reviewAdminForm.addEventListener(
    "submit",
    manageReviewAction.bind(reviewAdminForm)
  );

async function manageUserAction(e) {
  e.preventDefault();
  const adminContainer = document
    .getElementById("manage-users")
    .querySelector(".admin-container");
  const password = this.querySelector("#admin-password--0").value;
  const email = this.querySelector("#admin-email--0").value;
  try {
    const html = '<div class="spinner-mini"></div>';
    adminContainer.innerHTML = "";
    adminContainer.insertAdjacentHTML("afterbegin", html);

    const { data } = await fetchAll(password, email, "users");

    const userCardContainer = document.createElement("div");
    userCardContainer.classList.add("users-container");

    // Add user cards to the container
    data.forEach(user => {
      const userCard = userDetailCard(user);
      userCardContainer.insertAdjacentHTML("beforeend", userCard);
    });
    adminContainer.innerHTML = "";
    adminContainer.appendChild(userCardContainer);

    const addUserForm = UserManagementForm();
    const userManagementSection = document.getElementById("users-container");
    userManagementSection.insertAdjacentHTML("beforeend", addUserForm);
    const form = document.getElementById("addUserForm");
    form.addEventListener("submit", createNewUser);

    userCardContainer.addEventListener("click", async function(e) {
      const userId = e.target.closest(".user-card").dataset.id;
      if (e.target.closest("button")) {
        await deleteUserData(userId);
        userCardContainer.querySelector(`[data-id="${userId}"]`).remove();
      } else {
        const user = data
          .filter(el => el._id.toString() === userId.toString())
          .at(0);
        form.querySelector("#userName").defaultValue = form.querySelector(
          "#userName"
        ).value = user.name;
        form.querySelector("#userEmail").defaultValue = form.querySelector(
          "#userEmail"
        ).value = user.email;
        form.querySelector("#userRole").defaultValue = form.querySelector(
          "#userRole"
        ).value = user.role;
        form.querySelector("#userId").value = userId;
        form.querySelector("#userPhoto").value = "";
      }
    });
  } catch (error) {
    const html = adminContainerContent("users data", 0);
    adminContainer.innerHTML = "";
    adminContainer.insertAdjacentHTML("afterbegin", html);
    const form = adminContainer.querySelector(".admin-section--0");
    form.addEventListener("submit", manageUserAction.bind(form));
  }
}

async function manageReviewAction(e) {
  e.preventDefault();
  const password = this.querySelector("#admin-password--1").value;
  const email = this.querySelector("#admin-email--1").value;
  const html = '<div class="spinner-mini"></div>';
  const adminContainer = document
    .getElementById("manage-reviews")
    .querySelector(".admin-container");
  try {
    adminContainer.innerHTML = "";
    adminContainer.insertAdjacentHTML("afterbegin", html);
    const { data } = await fetchAll(password, email, "reviews");

    const userReviewContainer = document.createElement("ul");
    userReviewContainer.classList.add("user-reviews__container");

    // Add user cards to the container
    data.forEach((review, index) => {
      const reviewCard = ReviewDetailCard(review, index);
      userReviewContainer.insertAdjacentHTML("beforeend", reviewCard);
    });
    adminContainer.innerHTML = "";
    adminContainer.appendChild(userReviewContainer);

    userReviewContainer.querySelectorAll(".all-review").forEach(el =>
      el.addEventListener("click", function(e) {
        if (e.target.closest(".delete__reviews")) {
          const reviewId = e.target.closest(".all-review").dataset.id;
          deleteReview(reviewId);
        }
      })
    );
  } catch (error) {
    const html = adminContainerContent("the reviewed tour data", 1);
    adminContainer.innerHTML = "";
    adminContainer.insertAdjacentHTML("afterbegin", html);
    const form = adminContainer.querySelector(".admin-section--1");
    form.addEventListener("submit", manageReviewAction.bind(form));
  }
}

async function createNewUser(e) {
  e.preventDefault();
  const button = document.querySelector(".submit-new-user-button");
  button.textContent = "Updating";

  const id = document.getElementById("userId").value;
  const photo = document.getElementById("userPhoto").files[0];
  const name = document.getElementById("userName");
  const email = document.getElementById("userEmail");
  const role = document.getElementById("userRole");

  if (
    name.value === name.defaultValue &&
    email.value === email.defaultValue &&
    role.value === role.defaultValue &&
    !photo
  ) {
    showAlert("error", "Change any of the fields to update the user's data");
    return;
  }

  const form = new FormData();
  if (name.value !== name.defaultValue) form.append("name", name.value);
  if (email.value !== email.defaultValue) form.append("email", email.value);
  if (role.value !== role.defaultValue && role.value !== "Select a role")
    form.append("role", role.value);
  if (photo) form.append("photo", photo);

  const { data } = await updateUser(form, id);

  const userEl = document.querySelector(`[data-id="${id}"]`);
  userEl.querySelector(".user-image").src = `/img/users/${data.photo}`;
  userEl.querySelector(".user-name").textContent = data.name;
  userEl.querySelector(".user-email").textContent = data.email;
  const userRole = userEl.querySelector(".user-role");
  const roleClass = userRole.classList[1];
  userRole.textContent = data.role;
  userRole.classList.remove(roleClass);
  userRole.classList.add(`role-${data.role}`);

  email.value = name.value = "";
  role.value = "Select a role";
  button.textContent = "Update User";
}

function clickAction(e) {
  console.log(e.target);
}
