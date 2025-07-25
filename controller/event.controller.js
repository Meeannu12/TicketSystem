const Event = require("../model/event");

const dateConvertInUTC = (startDate, endTime) => {
  // Combine:
  const date = new Date(startDate);
  const [time, modifier] = endTime.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  date.setHours(hours);
  date.setMinutes(minutes);

  // This is IST, so convert to UTC:
  date.setMinutes(date.getMinutes() - 330); // IST = UTC +5:30

  // console.log("Store this UTC Date:", date.toISOString());
  return date;
};

// add New Event by admin only
const addEvent = async (req, res) => {
  const {
    eventName,
    eventShortName,
    startDate,
    startTime,
    endTime,
    eventCourse,
    venue,
    description,
    locationURL,
  } = req.body;
  try {
    if (
      !eventName ||
      !eventShortName ||
      !startDate ||
      !startTime ||
      !endTime ||
      !eventCourse ||
      !venue ||
      !description ||
      !locationURL
    ) {
      res.status(400).json({
        error: "missing fields required",
        message: {
          eventName: !eventName ? "eventName is required" : undefined,
          eventShortName: !eventShortName
            ? "eventShortName is required"
            : undefined,
          startDate: !startDate ? "startDate is required" : undefined,
          startTime: !startTime ? "startTime is required" : undefined,
          endTime: !endTime ? "endTime is required" : undefined,
          eventCourse: !eventCourse ? "eventCourse is required" : undefined,
          description: !description ? "description is required" : undefined,
          venue: !venue ? "venue is required" : undefined,
          locationURL: !locationURL ? "locationURL is require" : undefined,
        },
      });
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // console.log(req.file.filename);

    // // Combine:
    // const date = new Date(startDate);
    // const [time, modifier] = endTime.split(" ");
    // let [hours, minutes] = time.split(":").map(Number);

    // if (modifier === "PM" && hours !== 12) hours += 12;
    // if (modifier === "AM" && hours === 12) hours = 0;

    // date.setHours(hours);
    // date.setMinutes(minutes);

    // // This is IST, so convert to UTC:
    // date.setMinutes(date.getMinutes() - 330); // IST = UTC +5:30

    // console.log("Store this UTC Date:", date.toISOString());
    const date = dateConvertInUTC(startDate, endTime);

    console.log("getUTC Date", date);

    let newEvent = new Event({
      eventName,
      eventShortName,
      startDate: date, // MongoDB will store it as ISODate
      startTime,
      endTime,
      eventCourse,
      description,
      venue,
      imageURL: req.file.filename,
      locationURL,
    });

    newEvent = await newEvent.save();
    res.status(201).json({ message: "Event Add Successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get single event by id
const getEventById = async (req, res) => {
  const id = req.params.id;
  try {
    if (!id) {
      return res.status(400).json({ message: "Id is required in params" });
    }
    // console.log("Event Id", id);
    const newEvent = await Event.findById(id);
    if (!newEvent) {
      return res.status(404).json({ message: "This Event is not exist" });
    }
    res.status(200).json({ message: "Event get successful", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all event
const getAllEvent = async (req, res) => {
  try {
    const newEvent = await Event.find({});
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0]; // e.g. '2025-04-19'

    const futureEvents = newEvent.filter((event) => {
      const eventDate = new Date(event.startDate).toISOString().split("T")[0];
      return eventDate >= today;
    });

    res.status(200).json({
      message: "get all Events",
      events: futureEvents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// edit event only by admin
const editEvent = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ message: "Event id must be required" });
    }
    const callData = {};

    const anyPresent =
      req.query.startDate || req.query.startTime || req.query.endTime;

    // Step 2: If any present BUT not all present → error
    if (
      anyPresent &&
      (!req.query.startDate || !req.query.startTime || !req.query.endTime)
    ) {
      return res.status(400).json({
        message: {
          startDate: !req.query.startDate ? "startDate is required" : undefined,
          startTime: !req.query.startTime ? "startTime is required" : undefined,
          endTime: !req.query.endTime ? "endTime is required" : undefined,
        },
      });
    }
    if (req.query.eventName) callData.eventName = req.query.eventName;
    if (req.query.eventShortName)
      callData.eventShortName = req.query.eventShortName;
    if (req.query.startDate) {
      callData.startDate = dateConvertInUTC(
        req.query.startDate,
        req.query.endTime
      );
    }
    // callData.startDate = req.query.startDate;
    if (req.query.startTime) callData.startTime = req.query.startTime;
    if (req.query.endTime) callData.endTime = req.query.endTime;
    if (req.query.eventCourse) callData.eventCourse = req.query.eventCourse;
    if (req.query.venue) callData.venue = req.query.venue;
    if (req.query.description) callData.description = req.query.description;
    if (req.query.locationURL) callData.locationURL = req.query.locationURL;

    await Event.updateOne(
      { _id: id }, // ID ya filter condition
      { $set: callData } // dynamic data
    );
    res.status(200).json({ message: "Event update successful" });
  } catch (error) {
    res.status(500).json({ message: "error.message" });
  }
};

// reupload  image by admin
const reUploadEventImageById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    console.log(req.file.filename);

    let newImage = await Event.findByIdAndUpdate(
      id,
      { imageURL: req.file.filename },
      { new: true }
    );

    res.status(204).json({ message: "Image update successful", newImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all event by admin
const getAllEventByAdmin = async (req, res) => {
  try {
    const newEvent = await Event.find({});
    res.status(200).json({
      message: "get all Events",
      event: newEvent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// event delete by id
const deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("eventId", id);
    const newEvent = await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get All Live Event for staff and user
const getAllLiveEvent = async (req, res) => {
  const course = req.query.course;
  try {
    const now = new Date();
    const filter = {
      startDate: { $gt: now },
    };
    console.log("course", filter);
    if (req.query.course) filter.eventCourse = course;

    const upcomingEvents = await Event.find(filter);

    res.status(200).json({ message: upcomingEvents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addEvent,
  getEventById,
  getAllEvent,
  editEvent,
  reUploadEventImageById,
  getAllEventByAdmin,
  deleteEvent,
  getAllLiveEvent,
};
