const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    number: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    checkIn: {
      type: Boolean,
      default: false,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: true,
    },
    employeeId: String,
    member: [String],
    url: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// ✅ This makes (number, email, eventId) unique together
UserSchema.index({ number: 1, email: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
