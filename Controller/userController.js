const Users = require("../Model/userModel");
const { AppError } = require("../Utils/appErrors");
const catchAsync = require("../Utils/catchAsync");
const factory = require("./handlerFactory");

const checkAllowedFields = (obj, ...fields) => {
  const allowedObj = {};

  Object.keys(obj).forEach(el => {
    if (fields.includes(el)) allowedObj[el] = obj[el];
  });

  return allowedObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return new AppError(
      "Can't update password with this route. Visit '/update-password'.",
      403
    );
  }

  const updateFields = checkAllowedFields(req.body, "name", "email");

  const user = await Users.findByIdAndUpdate(req.user.id, updateFields, {
    runValidators: true,
    new: true
  });

  if (!user) {
    return new AppError("An error occurred while updating user data", 500);
  }

  res.status(200).json({
    status: "success",
    data: user
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Users.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead"
  });
};

exports.getUser = factory.getOne(Users);
exports.getAllUsers = factory.getAll(Users);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(Users);
exports.deleteUser = factory.deleteOne(Users);

/////////////
// Before refactoring
//////////////////

// exports.deleteUser = catchAsync(async (req, res) => {
//   const user = await Users.findByIdAndUpdate(req.user.id, { active: false });

//   if (!user) {
//     return new AppError("An error occurred while deleting user's account", 500);
//   }

//   res.status(204).json({
//     status: "success",
//     data: null
//   });
// });

// exports.getAllUsers = catchAsync(async (req, res) => {
//   const users = await Users.find();

//   res.status(200).json({
//     status: "success",
//     results: users.length,
//     data: users
//   });
// });

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: "success",
//     message: "Not user available"
//   });

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: "success",
//     message: "Not user available"
//   });
// };
// };
