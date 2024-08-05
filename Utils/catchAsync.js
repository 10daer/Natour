// const { AppError } = require("./appErrors");

module.exports = fn => {
  return (res, req, next) =>
    // fn(res, req, next).catch(err => next(new AppError(err.message)));
    fn(res, req, next).catch(next);
};
