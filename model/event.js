const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    eventName: String,
    eventShortName: String,
    startDate: {
      type: Date,
      required: true,
    },
    startTime: String,
    endTime: String,
    description: String,
    venue: String,
    locationURL: String,
    imageURL: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Events", EventSchema);
