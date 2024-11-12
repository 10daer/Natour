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
    minLength: [8, "Your password must contain more than 8 characters"],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE!!!
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
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function(next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to the current query
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
    const formattedDate = parseInt(this.passwordCreatedAt.getTime() / 1000, 10);
    return +formattedDate > +jwtTimestamp;
  }
  // False means NOT changed
  return false;
};

const Users = mongoose.model("User", userSchema);

module.exports = Users;
