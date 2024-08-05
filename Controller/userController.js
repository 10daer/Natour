const Users = require("../Model/userModel");
const { AppError } = require("../Utils/appErrors");
const catchAsync = require("../Utils/catchAsync");

const checkAllowedFields = (obj, ...fields) => {
  const allowedObj = {};

  Object.keys(obj).forEach(el => {
    if (fields.includes(el)) allowedObj[el] = obj[el];
  });

  return allowedObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await Users.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "success",
    message: "Not user available"
  });
};

exports.creatUser = (req, res) => {
  res.status(500).json({
    status: "success",
    message: "Not user available"
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "success",
    message: "Not user available"
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return new AppError(
      "Can't update passsword with this route. Visit '/update-password'.",
      403
    );
  }

  const updateFields = checkAllowedFields(req.body, "name", "email");

  const user = await Users.findByIdAndUpdate(req.user.id, updateFields, {
    runValidators: true,
    new: true
  });

  if (!user) {
    return new AppError("An error occured while updating user data", 500);
  }

  res.status(200).json({
    status: "success",
    data: user
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  const user = await Users.findByIdAndUpdate(req.user.id, { active: false });

  if (!user) {
    return new AppError("An error occured while deleting user's account", 500);
  }

  res.status(204).json({
    status: "success",
    data: null
  });
});
