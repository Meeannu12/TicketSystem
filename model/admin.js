const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // optional: set default role
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Admin", AdminSchema);
