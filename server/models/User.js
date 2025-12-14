const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: String,
    email: { type: String, required: true, unique: true },
    name: String,
    avatar: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
