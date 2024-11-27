/* eslint-disable*/

const convertToDate = date =>
  new Date(date).toLocaleString("en-us", {
    month: "short",
    year: "numeric",
    day: "numeric"
  });

export const userDetailCard = user => `
<div class="user-card" data-id=${user._id}>
    <img src="img/users/${user.photo}" alt="Photo of ${user.name}" class="user-image">
    <div class="user-info">
        <div class="user-name">${user.name}</div>
        <div class="user-email">${user.email}</div>
        <div class="user-role role-${user.role}">${user.role}</div>
    </div>
    <button class="delete-button"><svg><use xlink:href="img/icons.svg#icon-trash"></use></svg></button>
</div>`;

export const UserManagementForm = () => `<form id="addUserForm" >
    <div class="form-grid gap mg-top">
      <div class="form-group">
      <input
      placeholder="Name"
      type="text"
      id="userName"
            name="name"
            class="form-input"
            required
          />
        </div>
        <div class="form-group">
          <input
            placeholder="example@natours.io"
            type="email"
            id="userEmail"
            name="email"
            class="form-input"
            required
          />
        </div>      
        <div class="form-group">
          <select id="userRole" name="role" class="form-select" required>
            <option value="">Select a role</option>
            <option value="user">User</option>
            <option value="guide">Guide</option>
            <option value="lead-guide">Lead Guide</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="file-input-container">
        <input
        placeholder="Name"
        type="file"
        id="userPhoto"
        name="photo"
        class="form__upload"
        accept="image/*"
        />
        <label for="userPhoto">
        <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        >
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7"></path>
              <polyline points="7 9 12 4 17 9"></polyline>
              <line x1="12" y1="4" x2="12" y2="16"></line>
            </svg>
            <span>Choose photo</span>
            </label>
        </div>
        <input
        type="hidden"
          id="userId"
          name="userId"
          />
      </div>
      <div class="form__group right">
        <button type="submit" class="submit-new-user-button btn btn--green">Update user</button>
      </div>
    </form>`;

export const ReviewDetailCard = (review, index) => `
    <li>
      <span class="review-index">${(index + 1).toString().padStart(2, "0")}
      </span>
      <div class="review all-review" data-id=${review.id}>
        <div class="review__author">
          <img src="img/users/${review.user.photo}" alt="Photo-of-${
  review.user.name
}">
          <span>${review.user.name}</span>
        </div>
        <div class="review__detail">
          <div class="review-header">
            <h3 class="home-heading-tertiary">The Forest Hiker</h3>                      
          </div>
          <p>
            ${review.review}
          </p>
          <div class="review__footer">
            <div class="reviews__rating">
              <svg class="reviews__star reviews__star--${
                1 <= +review.rating ? "active" : "inactive"
              }">
                <use xlink:href="/img/icons.svg#icon-star"></use>
              </svg>
              <svg class="reviews__star reviews__star--${
                2 <= +review.rating ? "active" : "inactive"
              }">
                <use xlink:href="/img/icons.svg#icon-star"></use>
              </svg>
              <svg class="reviews__star reviews__star--${
                3 <= +review.rating ? "active" : "inactive"
              }">
                <use xlink:href="/img/icons.svg#icon-star"></use>
              </svg>
              <svg class="reviews__star reviews__star--${
                4 <= +review.rating ? "active" : "inactive"
              }">
                <use xlink:href="/img/icons.svg#icon-star"></use>
              </svg>
              <svg class="reviews__star reviews__star--${
                5 <= +review.rating ? "active" : "inactive"
              }">
                <use xlink:href="/img/icons.svg#icon-star"></use>
              </svg>
            </div>
            <div class="review__date">
              <span class="review__date">${convertToDate(
                review.createdAt
              )}</span>
              <svg class="delete__reviews">
                <use xlink:href="/img/icons.svg#icon-trash"></use>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </li>`;

export const adminContainerContent = (message, index) => `
                    <h2 class="account-heading-primary">Input your administration password to get all ${message}</h2>
                    <form class="admin-form admin-section--${index}">
                      <div class="form__group ma-bt-lg">
                        <label class="form__label" for="admin-password">Confirm password</label>
                        <input class="form__input" id="admin-password--${index}" type="password" placeholder="••••••••" required="required" minlength="8">
                        <input class="form__input" id="admin-email--${index}" type="hidden" value="admin@natours.io">
                      </div>
                      <div class="form__group right">
                        <button class="btn btn--small btn--green btn--confirm-password" id="btn-2">Confirm password</button>
                        </div>
                    </form>`;

export const BookedTourCard = ({
  createdAt,
  tour,
  user,
  price,
  paid
}) => `<div class="booking__card">
                        <div class="booking__card-header">
                          <div class="booking__card-picture">
                            <div class="card__picture-overlay">&nbsp;</div>
                            <img
                              class="card__picture-img"
                              src="/img/tours/${tour.imageCover}"
                              alt="${tour.name}"
                            />                            
                          </div>
                        </div>
                        <div class="card__details-container">
                          <div class="card__details-header">
                            <h4 class="card__sub-heading">an ${
                              tour.difficulty
                            } ${tour.duration}-day tour of ${tour.name}</h4>
                            <a class="link" href="/tour/${tour.slug}">
                              <svg class="card__icon">
                                <use xlink:href="/img/icons.svg#icon-link"></use></svg
                            ></a>
                          </div>
                          <div class="card__details flex">
                           <div class="card__dates">
                            <div class="card__data">
                            <svg class="card__icon">
                            <use xlink:href="/img/icons.svg#icon-calendar"></use>
                                </svg>
                                <span>
                                  ${convertToDate(createdAt)}
                                </span>
                              </div>
                              ${tour.startDates
                                .map(
                                  date => `<div class="card__data">
                                  <svg class="card__icon">
                                    <use xlink:href="/img/icons.svg#icon-calendar"></use>
                                  </svg>
                                  <span>
                                  ${convertToDate(date)}
                                  </span>
                                  </div>`
                                )
                                .join("")}
                                </div>
                          <div class="card__other-details">
                            <div class="card__data">
                              <svg class="card__icon">
                                <use xlink:href="/img/icons.svg#icon-flag"></use>
                              </svg>
                              <span>${tour.locations.length} stops</span>
                            </div>
                            <div class="card__data booking-author">                                             
                              <img class="card__user-photo" src="/img/users/${
                                user.photo
                              }" alt="${user.name} photo">
                              <span>${user.name.split(" ").at(0)} ${user.name
  .split(" ")
  .at(1)
  .slice(0, 1)
  .toUpperCase()}.</span>
                            </div>                           
                            <div class="card__data">
                              <svg class="card__icon">
                                <use xlink:href="/img/icons.svg#icon-star"></use>
                              </svg>
                              <span>${Math.round(tour.ratingsAverage).toFixed(
                                1
                              )} (${tour.ratingsQuantity})</span>
                            </div>
                            <div class="card__data">
                              <svg class="card__icon">
                                <use xlink:href="/img/icons.svg#icon-user"></use>
                              </svg>
                              <span>${tour.maxGroupSize} people</span>
                            </div>
                            <div class="card__data">
                              <svg class="card__icon">
                                <use xlink:href="/img/icons.svg#icon-user"></use>
                              </svg>
                              <span>$${tour.price} Paid</span>
                            </div>
                            <div class="card__data">
                              <svg class="card__icon">
                                <use xlink:href="/img/icons.svg#icon-map-pin"></use>
                              </svg>
                              <span>${tour.startLocation.description}</span>
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>`;
