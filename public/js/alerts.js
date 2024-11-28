/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
export const showAlert = (type, msg, time = 7.5) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}"><svg>
        <use xlink:href="img/icons.svg#icon-alert-${
          type === "error" ? "triangle" : "bookmark"
        }"></use></svg><span>${msg}</span></div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  window.setTimeout(hideAlert, time * 1000);
};
