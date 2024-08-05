const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"]
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: [true, "A user email must be provided"],
    validate: [validator.isEmail, "Please provide a valid email"]
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user"
  },
  password: {
    type: String,
    required: [true, "A password must be provided"],
    minLength: [8, "Your password must contain more than 8 characters"]
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function(val) {
        return this.password === val;
      },
      message: "Your password is incorrect. Please enter  the correct password"
    }
  },
  Photo: String,
  passwordCreatedAt: Date,
  passwordResetToken: String,
  passwordTokenExpiryDate: Date,
  active: {
    type: Boolean,
    default: true,
    required: true
  }
});

userSchema.pre("save", async function(next) {
  if (!this.isModified("password") && !this.isNew) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  this.passwordCreatedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.verifyPasswords = async function(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};

userSchema.methods.generateToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordTokenExpiryDate = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.verifyPasswordChange = function(jwtTimestamp) {
  if (this.passwordCreatedAt) {
    const formatedDate = parseInt(this.passwordCreatedAt.getTime() / 1000, 10);
    return +formatedDate > +jwtTimestamp;
  }
  return false;
};

const Users = mongoose.model("User", userSchema);

module.exports = Users;
