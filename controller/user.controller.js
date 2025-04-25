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

    // check if this event user already exist then throw error
    const existingUser = await User.findOne({
      number,
      email,
      eventId: id,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "You have already registered for this event.",
      });
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
      locationURL: populatedUser.eventId.locationURL,
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

    await User.findByIdAndUpdate(
      newUser._id,
      { url: URL.fileURL },
      { new: true }
    );

    const emaildata = await nodeEmailFunction(userData);
    const numberData = whatsappAPi(userData);

    res.status(201).json({ message: "Ticket is generated successfully", URL });
  } catch (error) {
    // console.log(error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const checkInUser = async (req, res) => {
  try {
    const id = req.params.id;
    const checkInUser = await User.findById(id);
    if (!checkInUser) {
      return res.status(404).json({ message: "User not found in Database" });
    }

    if (checkInUser.checkIn) {
      return res
        .status(200)
        .json({ message: "user already checkedIn", user: checkInUser });
    }

    await User.findByIdAndUpdate(
      checkInUser._id,
      { checkIn: true },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "user checkIn successfully", user: checkInUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getAllnumber = async (req, res) => {
//   const id = req.params.id;
//   try {
//     const getUser = await User.find({ eventId: id }).populate("eventId");
//     // const numbers = getNumber.map((user) => user.number);
//     res.status(200).json({ message: "get all User", user: getUser });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getAllStudents = async (req, res) => {
  const id = req.params.id;
  try {
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = parseInt(req.query.limit) || 50; // default to 10 items per page
    const newUsers = await User.find({ eventId: id }).populate("eventId");

    // If page and limit are provided, paginate the results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const resultData = newUsers.slice(startIndex, endIndex);

    const results = {
      totalItems: resultData.length,
      currentPage: page,
      totalPages: Math.ceil(resultData.length / limit),
      data: resultData,
    };
    res.status(200).json({ message: "All Event User", results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addUser, checkInUser, getAllStudents };
