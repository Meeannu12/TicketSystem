const { nodeEmailFunction } = require("../config/nodemailer");
const generateTicketPDF = require("../config/pdfGenrator");
const whatsappAPi = require("../config/whatsappAPI");
const Event = require("../model/event");
const User = require("../model/user");

const addUser = async (req, res) => {
  try {
    const { name, number, email } = req.body;
    const id = req.params.id;
    if (!name || !number || !email) {
      return res.status(400).json({
        error: "missing field require",
        message: {
          name: !name ? "name is required" : undefined,
          number: !number ? "number is required" : undefined,
          email: !email ? "email is required" : undefined,
          //   eventId: !eventId ? "eventId is required" : undefined,
        },
      });
    }

    // check current event is expair or not
    const newEvent = await Event.findById(id);
    const today = new Date();
    // console.log(today, "hell", newEvent.startDate);
    if (newEvent.startDate < today) {
      return res.status(200).json({ message: "Event is expair" }); // Checks if event has already started
    }

    let newUser = new User({ name, number, email, eventId: id });
    newUser = await newUser.save();

    // Populate event info
    const populatedUser = await User.findById(newUser._id).populate("eventId");

    const start = new Date(populatedUser.eventId.startDate);
    const startD = start.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    const date = new Date(start);

    const formatted = new Intl.DateTimeFormat("en-CA").format(date);
    const ticketData = {
      req,
      name: populatedUser.name,
      bookingId: populatedUser._id.toString(),
      bookingDate: Date.now(),
      eventName: populatedUser.eventId.eventName,
      eventDate: `${startD} (${populatedUser.eventId.startTime} to ${populatedUser.eventId.endTime})`,
      ticketName: populatedUser.eventId.eventShortName,
      location: populatedUser.eventId.venue,
    };

    const URL = await generateTicketPDF(ticketData);
    // console.log("URL", URL);

    const userData = {
      gmail: populatedUser.email,
      number: populatedUser.number,
      name: populatedUser.name,
      eventShortName: populatedUser.eventId.eventShortName,
      startDate: `${formatted}`, //(${populatedUser.eventId.startTime} to ${populatedUser.eventId.endTime})`,
      venue: populatedUser.eventId.venue,
      link: URL.fileURL,
    };

    const emaildata = await nodeEmailFunction(userData);
    const numberData = whatsappAPi(userData);

    res
      .status(201)
      .json({ message: "Ticket is generated successfully", URL: URL.fileName });
  } catch (error) {
    // console.log(error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = addUser;
