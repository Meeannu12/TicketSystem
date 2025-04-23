const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    number: {
      type: String,
      required: true,
    },
    bookingId: String,
    email: {
      type: String,
      required: true,
    },
    checkIn: {
      type: Boolean,
      default: false,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: true,
    },
    url: String,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("User", UserSchema);
