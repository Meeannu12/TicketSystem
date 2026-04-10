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
    eventCourse: String,
    // endDate: {
    //   type: Date,
    //   required: true,
    // },
    description: String,
    city: {
      type: String,
      default: 'delhi'
    },
    ticketName: {
      type: String,
      default: 'Webinar Tickets'
    },
    longitude: {
      type: String,
      default: null
    },
    latitude: {
      type: String,
      default: null
    },
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
