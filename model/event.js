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
    domain: {
      type: String,
      enum: ['all','expo', 'seminar'],
      default: 'all'
    },
    description: String,
    city: {
      type: String,
      default: 'delhi'
    },
    view: {
      type: Boolean,
      default: true
    },
    webview: {
      type: Boolean,
      default: true,
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
