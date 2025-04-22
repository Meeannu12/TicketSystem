const Event = require("../model/event");

// add New Event
const addEvent = async (req, res) => {
  const {
    eventName,
    eventShortName,
    startDate,
    startTime,
    endTime,
    venue,
    description,
  } = req.body;
  try {
    if (
      !eventName ||
      !eventShortName ||
      !startDate ||
      !startTime ||
      !endTime ||
      !venue ||
      !description
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
          description: !description ? "description is required" : undefined,
          venue: !venue ? "venue is required" : undefined,
        },
      });
    }
    let newEvent = new Event({
      eventName,
      eventShortName,
      startDate,
      startTime,
      endTime,
      description,
      venue,
    });
    newEvent = await newEvent.save();
    res.status(201).json({ message: "Event Add Successful", newEvent });
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

module.exports = {
  addEvent,
  getEventById,
  getAllEvent,
};
