/* eslint-disable */
import { showAlert } from "./alerts";
import Choices from "choices.js";
import {
  forgetPassword,
  login,
  logout,
  resetPassword,
  signup,
  fetchAll,
  verifyAccount,
  regenerateToken
} from "./auth";
import { displayMap, setLocation } from "./leaflet";
import { addReview, deleteReview } from "./review";
import { updateUser, deleteUserData } from "./user";
import { loadToursData } from "./tour";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";
import {
  adminContainerContent,
  ReviewDetailCard,
  userDetailCard,
  UserManagementForm,
  BookedTourCard
} from "./html";
import flatpickr from "flatpickr";
import { createTour, updateTour } from "./tour";

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
const selectTour = document.getElementById("tour-options");
const accountPage = document.getElementById("account");
const manageTourForm = document.getElementById("manage-tours");
const tourForm = document.getElementById("tourForm");
const verifyAccountPageEl = document.querySelector(".verify-account");

let timer;

// DELEGATIONS
if (leafletMap) {
  const initialValue = [27.9881, 86.925];

  if (leafletMap.dataset.locations) {
    const locations = JSON.parse(leafletMap.dataset.locations);
    displayMap(locations);
  } else {
    setLocation(initialValue);
  }
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

if (verifyAccountPageEl) {
  let timerEl;
  timerEl = verifyAccountPageEl.querySelector(".timer");
  const resend = verifyAccountPageEl.querySelector(".countdown");
  const verifyForm = verifyAccountPageEl.querySelector(".form-verify");
  const inputs = verifyForm.querySelectorAll("input");
  const hiddenInput = verifyForm.querySelector("#hidden-input");

  const startLogOutTimer = function() {
    const tick = function() {
      const min = String(Math.trunc(time / 60)).padStart(2, 0);
      const sec = String(time % 60).padStart(2, 0);

      // In each call, print the remaining time to UI
      timerEl.textContent = `${min}:${sec}`;

      // When 0 seconds, stop timer and log out user
      if (time === 0) {
        clearInterval(timer);
        resend.innerHtml = "";
        resend.textContent = "Resend code";
        resend.classList.add("link");
        const resendLink = verifyAccountPageEl.querySelector(".link");
        resendLink.addEventListener("click", async e => {
          inputs.forEach(input => {
            if (input.type !== "hidden") input.value = "";
          });
          const html = `<span>Resend verification code in </span><span class="timer">03:00</span>`;
          const data = hiddenInput.value;
          resend.textContent = "";
          resend.insertAdjacentHTML("beforeend", html);
          resend.classList.remove("link");
          timerEl = verifyAccountPageEl.querySelector(".timer");
          clearInterval(timer);
          timer = startLogOutTimer();
          await regenerateToken(data);
        });
      }

      // Decrease 1s
      time--;
    };

    // Set time to 5 minutes
    let time = 180;

    // Call the timer every second
    tick();
    const setTimer = setInterval(tick, 1000);

    return setTimer;
  };

  resend.addEventListener("click", async e => {
    inputs.forEach(input => {
      if (input.type !== "hidden") input.value = "";
    });
    const html = `<span>Resend verification code in </span><span class="timer">03:00</span>`;
    const data = hiddenInput.value;
    resend.textContent = "";
    resend.insertAdjacentHTML("beforeend", html);
    resend.classList.remove("link");
    timerEl = verifyAccountPageEl.querySelector(".timer");
    clearInterval(timer);
    timer = startLogOutTimer();
    await regenerateToken(data);
  });

  inputs.forEach((input, index) => {
    if (input.type === "hidden") return;

    input.addEventListener("input", e => {
      if (e.target.value.length > 1) {
        e.target.value = e.target.value.slice(0, 1);
      }

      if (e.target.value.length === 1) {
        const nextInput = inputs[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    });

    input.addEventListener("keydown", e => {
      if (e.key === "Backspace" && e.target.value.length === 0) {
        const prevInput = inputs[index - 1];
        if (prevInput) {
          prevInput.value = "";
          prevInput.focus();
        }
      }
    });
  });

  verifyForm.addEventListener("submit", async e => {
    e.preventDefault();

    const input0 = verifyForm.querySelector("#verify-input-0").value;
    const input1 = verifyForm.querySelector("#verify-input-1").value;
    const input2 = verifyForm.querySelector("#verify-input-2").value;
    const input3 = verifyForm.querySelector("#verify-input-3").value;
    const input4 = verifyForm.querySelector("#verify-input-4").value;
    const input5 = verifyForm.querySelector("#verify-input-5").value;
    const data = input0 + input1 + input2 + input3 + input4 + input5;

    await verifyAccount(data);
  });
}

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

if (manageTourForm)
  document.addEventListener("DOMContentLoaded", async () => {
    const guide = document.getElementById("guide");
    const calendar = document.getElementById("calendar");

    const guideChoice = new Choices(guide, {
      removeItemButton: true,
      duplicateItemsAllowed: false,
      placeholder: true,
      placeholderValue: "Select guide...",
      searchEnabled: true,
      shouldSort: false
    });

    const startDates = flatpickr(calendar, {
      mode: "multiple",
      dateFormat: "Y-m-d"
    });

    if (manageTourForm) {
      let tours = await loadToursData();
      let tourId;
      let tour;
      const tourName = tourForm.querySelector("#tour-name");
      const duration = tourForm.querySelector("#duration");
      const maxGroupSize = tourForm.querySelector("#maxGroupSize");
      const difficulty = tourForm.querySelector("#difficulty");
      const price = tourForm.querySelector("#price");
      const summary = tourForm.querySelector("#summary");
      const description = tourForm.querySelector("#description");
      const locationLat = tourForm.querySelector("#locationLat-0");
      const locationLng = tourForm.querySelector("#locationLng-0");
      const locationDay = tourForm.querySelector("#locationDay-0");
      const locationDescription = tourForm.querySelector(
        "#locationDescription-0"
      );
      const startLocationLat = tourForm.querySelector("#startLocationLat");
      const startLocationLng = tourForm.querySelector("#startLocationLng");
      const startLocationAddress = tourForm.querySelector(
        "#startLocationAddress"
      );
      const startLocationDescription = tourForm.querySelector(
        "#startLocationDescription"
      );
      const addImages = tourForm.querySelector("#addImages");
      const imageCover = tourForm.querySelector("#imageCover");
      const groupLat = document.querySelector(".group-lat");
      const groupLng = document.querySelector(".group-lng");
      const groupDay = document.querySelector(".group-day");
      const groupDescription = document.querySelector(".group-description");

      const clearTourForm = () => {
        tourName.value = duration.value = maxGroupSize.value = difficulty.value = price.value = summary.value = description.value = locationLat.value = locationLng.value = locationDay.value = locationDescription.value = startLocationLat.value = startLocationLng.value = startLocationAddress.value = startLocationDescription.value = tourId =
          "";
        startDates.clear();
        guideChoice.removeActiveItems();
        groupLat.querySelectorAll("input").forEach(el => {
          if (el.getAttribute("id") !== `locationLat-0`) el.remove();
        });
        groupLng.querySelectorAll("input").forEach(el => {
          if (el.getAttribute("id") !== `locationLng-0`) el.remove();
        });
        groupDay.querySelectorAll("input").forEach(el => {
          if (el.getAttribute("id") !== `locationDay-0`) el.remove();
        });
        groupDescription.querySelectorAll("textarea").forEach(el => {
          if (el.getAttribute("id") !== `locationDescription-0`) el.remove();
        });
      };

      const createLocations = () => {
        const loc = [];
        groupLat.querySelectorAll("input").forEach((el, i) => {
          loc[i] = {};
          loc.at(i).coordinates = [];
          loc.at(i).coordinates[0] = +el.value;
          loc.at(i).type = "Point";
        });
        groupLng.querySelectorAll("input").forEach((el, i) => {
          loc.at(i).coordinates[1] = +el.value;
        });
        groupDay.querySelectorAll("input").forEach((el, i) => {
          loc.at(i).day = +el.value;
        });
        groupDescription.querySelectorAll("textarea").forEach((el, i) => {
          loc.at(i).description = el.value;
        });
        return loc;
      };

      const createStartLocation = tour => {
        const loc = {};
        loc.type = "Point";
        if (+tour.startLocation.coordinates[0] !== +startLocationLat.value)
          loc.coordinates[0] = +startLocationLat.value;
        if (+tour.startLocation.coordinates[1] !== +startLocationLng.value)
          loc.coordinates[1] = +startLocationLng.value;
        if (tour.startLocation.address !== startLocationAddress.value)
          loc.address = startLocationAddress.value;
        if (tour.startLocation.description !== startLocationDescription.value)
          loc.description = startLocationDescription.value;
        return loc;
      };

      const createFormData = () => {
        const form = new FormData();
        const locations = createLocations();
        const startLocation = createStartLocation(tour);
        const selectedGuides = guideChoice.getValue().map(el => el.value);

        if (difficulty.value && difficulty.value !== tour.difficulty)
          form.append("difficulty", difficulty.value);
        if (description.value && description.value !== tour.description)
          form.append("description", description.value);
        if (duration.value && +duration.value !== +tour.duration)
          form.append("duration", duration.value);
        if (selectedGuides) form.append("guides", selectedGuides);
        if (imageCover.files.length > 0)
          form.append("imageCover", imageCover.files[0]);
        if (addImages.files.length > 0)
          form.append(
            "images",
            addImages.files.map(el => el)
          );
        if (locations.length > 0) form.append("locations", locations);
        if (maxGroupSize.value && +maxGroupSize.value !== +tour.maxGroupSize)
          form.append("maxGroupSize", +maxGroupSize.value);
        if (tourName.value && tourName.value !== tour.name)
          form.append("name", tourName.value);
        if (price.value && +price.value !== +tour.price)
          form.append("price", +price.value);
        if (summary.value && summary.value !== tour.summary)
          form.append("summary", summary.value);
        if (startDates.selectedDates)
          form.append("startDates", [startDates.selectedDates]);
        if (Object.entries(startLocation).length > 1)
          form.append("startLocation", startLocation);

        for (const [key, value] of form.entries()) {
          console.log(`${key}:${value}`);
        }

        return form;
      };

      if (selectTour)
        selectTour.addEventListener("click", async function(e) {
          if (!tours.length) tours = await loadToursData();
          const id = e.target.value;
          tour = tours.find(el => el.id === id);
          console.log(tour);
          if (tour) {
            clearTourForm();

            tourName.value = tour.name;
            duration.value = tour.duration;
            maxGroupSize.value = tour.maxGroupSize;
            difficulty.value = tour.difficulty;
            price.value = tour.price;
            summary.value = tour.summary;
            description.value = tour.description;
            locationLat.value = tour.locations[0].coordinates[0];
            locationLng.value = tour.locations[0].coordinates[1];
            locationDay.value = tour.locations[0].day;
            locationDescription.value = tour.locations[0].description;
            tour.locations.forEach((loc, i) => {
              if (i > 0) {
                const latInput = `<input value="${loc.coordinates[0]}" id="locationLat-${i}" type="number" step="any">`;
                groupLat.insertAdjacentHTML("beforeend", latInput);
                const lngInput = `<input value="${loc.coordinates[1]}" id="locationLng-${i}" type="number" step="any">`;
                groupLng.insertAdjacentHTML("beforeend", lngInput);
                const dayInput = `<input value="${loc.day}" id="locationDay-${i}" type="number" step="any">`;
                groupDay.insertAdjacentHTML("beforeend", dayInput);
                const descriptionTextArea = `<textarea id="locationDescription-${i}" name="locationDescription-${i}" placeholder="Add a description"></textarea>`;
                groupDescription.insertAdjacentHTML(
                  "beforeend",
                  descriptionTextArea
                );
                groupDescription.querySelector(
                  `#locationDescription-${i}`
                ).value = loc.description;
              }
            });
            tourId = id;
            setLocation(tour.locations, true);
            tourForm.querySelector("#startLocationLat").value =
              tour.startLocation.coordinates[0];
            tourForm.querySelector("#startLocationLng").value =
              tour.startLocation.coordinates[1];
            tourForm.querySelector("#startLocationAddress").value =
              tour.startLocation.address;
            tourForm.querySelector("#startLocationDescription").value =
              tour.startLocation.description;
            startDates.setDate(tour.startDates);
            const chosenGuides = tour.guides.map(guide => guide._id);
            chosenGuides.forEach(optionValue => {
              guideChoice.setChoiceByValue(optionValue);
            });
            tourForm.querySelector(".btn-create").classList.add("hide");
            tourForm.querySelector(".btn-update").classList.remove("hide");
          }
        });

      tourForm
        .querySelector(".btn-update")
        .addEventListener("click", async e => {
          e.preventDefault();
          try {
            const data = createFormData();
            console.log(data);
            await updateTour(data, tourId);
            console.log("submitted");
          } catch (error) {
            console.log(error);
          }
        });

      tourForm
        .querySelector(".btn-create")
        .addEventListener("click", async e => {
          e.preventDefault();
          try {
            const data = createFormData();
            console.log(data);
            // await createTour(data);
            console.log("submitted");
          } catch (error) {
            console.log(error);
          }
        });

      tourForm.querySelector(".btn-reset").addEventListener("click", () => {
        clearTourForm();
        setLocation([27.9881, 86.925]);
        tourForm.querySelector(".btn-create").classList.remove("hide");
        tourForm.querySelector(".btn-update").classList.add("hide");
      });
    }
  });

if (bookBtn)
  bookBtn.addEventListener("click", async e => {
    try {
      bookBtn.textContent = "Processing...";
      const tourId = tourSection.dataset.tourid;
      await bookTour(tourId);
    } catch (error) {
      bookBtn.textContent = "Book tour now!";
      showAlert("error", error.message);
    }
  });

if (tourSection && submitReviewBtn)
  submitReviewBtn.addEventListener("click", submitReview);

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

if (bookingAdminForm)
  bookingAdminForm.addEventListener(
    "submit",
    manageBookingAction.bind(bookingAdminForm)
  );

async function manageUserAction(e) {
  e.preventDefault();
  const { adminContainer, password, email } = clearForm(
    "manage-users",
    this,
    0
  );

  try {
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

async function submitReview(e) {
  e.preventDefault();
  const review = document.querySelector("textarea").value;
  const rating = Number(reviewRating.dataset.rating);
  const tour = tourSection.dataset.tourid;

  await addReview(review, rating, tour);

  submitReviewBtn.textContent = "Thank you 🥳";
  submitReviewBtn.removeEventListener("click", submitReview);

  window.location.hash = "#cta";
}

function clearForm(id, parent, index) {
  const adminContainer = document
    .getElementById(id)
    .querySelector(".admin-container");
  const password = parent.querySelector(`#admin-password--${index}`).value;
  const email = parent.querySelector(`#admin-email--${index}`).value;
  const html = '<div class="spinner-mini"></div>';
  adminContainer.innerHTML = "";
  adminContainer.insertAdjacentHTML("afterbegin", html);
  return { adminContainer, password, email };
}

async function manageBookingAction(e) {
  e.preventDefault();
  const { adminContainer, password, email } = clearForm(
    "manage-bookings",
    this,
    2
  );

  try {
    const { data } = await fetchAll(password, email, "bookings");

    const userBookingContainer = document.createElement("ul");
    userBookingContainer.classList.add("user-bookings__container");

    // Add user cards to the container
    data.forEach(booking => {
      const bookingCard = BookedTourCard(booking);
      userBookingContainer.insertAdjacentHTML("beforeend", bookingCard);
    });
    adminContainer.innerHTML = "";
    adminContainer.appendChild(userBookingContainer);
  } catch (error) {
    const html = adminContainerContent("booking data", 2);
    adminContainer.innerHTML = "";
    adminContainer.insertAdjacentHTML("afterbegin", html);
    const form = adminContainer.querySelector(".admin-section--2");
    form.addEventListener("submit", manageBookingAction.bind(form));
  }
}

async function manageReviewAction(e) {
  e.preventDefault();
  const { adminContainer, password, email } = clearForm(
    "manage-reviews",
    this,
    1
  );

  try {
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
