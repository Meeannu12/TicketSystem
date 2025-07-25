const { nodeEmailFunction } = require("../config/nodemailer");
const generateTicketPDF = require("../config/pdfGenrator");
const { whatsappAPi, confirmationMessage } = require("../config/whatsappAPI");
const Event = require("../model/event");
const User = require("../model/user");
const jwt = require("jsonwebtoken");

const addUser = async (req, res) => {
  try {
    const { name, number, email, member } = req.body;
    const id = req.params.id;
    if (!name || !number || !email) {
      return res.status(400).json({
        error: "missing field require",
        message: {
          name: !name ? "name is required" : undefined,
          number: !number ? "number is required" : undefined,
          email: !email ? "email is required" : undefined,
        },
      });
    }

    // check current event is expair or not
    const newEvent = await Event.findById(id);
    const currentDate = new Date();

    // check if event not exist in db
    if (!newEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    // check event is expired or not
    if (currentDate > newEvent.startDate) {
      return res.status(200).json({ message: "This event is expired" });
    }
    // check if this event user already exist then throw error
    const existingUser = await User.findOne({
      number,
      email,
      eventId: id,
    });

    // check if user already exist with the same event then return error
    if (existingUser) {
      return res.status(400).json({
        message: "You have already registered for this event.",
      });
    }

    let newUser = new User({
      name,
      number,
      email,
      eventId: id,
      member: member || [],
    });
    newUser = await newUser.save();

    // Populate event info
    const populatedUser = await User.findById(newUser._id).populate("eventId");

    const start = new Date(populatedUser.eventId.startDate);
    const startD = start.toLocaleString("en-In", {
      timeZone: "Asia/Kolkata",
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
      eventShortName: populatedUser.eventId.eventShortName,
      location: populatedUser.eventId.venue,
      locationURL: populatedUser.eventId.locationURL,
    };

    const URL = await generateTicketPDF(ticketData);
    // console.log("URL", URL);

    const formattedDate = new Date(formatted).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const userData = {
      gmail: populatedUser.email,
      number: populatedUser.number,
      name: populatedUser.name,
      eventShortName: populatedUser.eventId.eventShortName,
      eventName: populatedUser.eventId.eventName,
      startDate: `${formattedDate} ${populatedUser.eventId.startTime}`, //to ${populatedUser.eventId.endTime})`,
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

    res
      .status(201)
      .json({ message: "Ticket is generated successfully", user: newUser._id });
  } catch (error) {
    // console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const directLogin = async (req, res) => {
  try {
    const { name, number, email, member } = req.body;
    const id = req.params.id;
    const user = req.user;
    console.log("user Details", user);

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
    const currentDate = new Date();

    // check if event not exist in db
    if (!newEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    // check event is expired or not
    if (currentDate > newEvent.startDate) {
      return res.status(200).json({ message: "This event is expired" });
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
    let newUser = new User({
      name,
      number,
      email,
      eventId: id,
      checkIn: true,
      employeeId: user.employeeId,
      checkInTime: new Date(),
      member: member || [],
    });
    newUser = await newUser.save();

    // Populate event info
    const populatedUser = await User.findById(newUser._id).populate("eventId");

    const start = new Date(populatedUser.eventId.startDate);
    const startD = start.toLocaleString("en-In", {
      timeZone: "Asia/Kolkata",
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
      eventShortName: populatedUser.eventId.eventShortName,
      location: populatedUser.eventId.venue,
      locationURL: populatedUser.eventId.locationURL,
    };

    const URL = await generateTicketPDF(ticketData);
    // console.log("URL", URL);

    const formattedDate = new Date(formatted).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const userData = {
      gmail: populatedUser.email,
      number: populatedUser.number,
      name: populatedUser.name,
      eventShortName: populatedUser.eventId.eventShortName,
      eventName: populatedUser.eventId.eventName,
      startDate: `${formattedDate} ${populatedUser.eventId.startTime}`, //to ${populatedUser.eventId.endTime})`,
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

    res.status(201).json({
      message: "Ticket create and checkIn successful",
      user: newUser._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const checkInStatus = await User.findById(id)
      .select("name checkIn eventId member") // only select 'name', 'checkIn', and 'eventId' from user
      .populate({
        path: "eventId",
        select: "eventName startDate startTime venue", // only select these fields from Event
      });
    if (!checkInStatus) {
      return res.status(404).json({ message: "User not found in Database" });
    }

    res.status(200).json({
      message: "User data fetch successfully",
      user: checkInStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkInUser = async (req, res) => {
  try {
    const { id, member } = req.body;
    const user = req.user;
    console.log("user Details", user);
    // console.log(id, member);
    const checkInUser = await User.findById(id);
    if (!checkInUser) {
      return res.status(404).json({ message: "User not found in Database" });
    }

    if (checkInUser.checkIn) {
      return res
        .status(200)
        .json({ message: "user already checkedIn", user: checkInUser });
    }

    const newUser = await User.findByIdAndUpdate(
      checkInUser._id,
      {
        checkIn: true,
        checkInTime: new Date(),
        member: member,
        employeeId: user.employeeId,
      },
      { new: true }
    ).populate("eventId");

    const data = {
      eventName: newUser.eventId.eventName,
      name: `${newUser.name}, ${newUser?.member}`,
      count: newUser?.member?.length ? newUser.member.length + 1 : 1,
      number: newUser.number,
    };
    confirmationMessage(data);

    res.status(200).json({ message: "user checkIn successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllStudentByEvent = async (req, res) => {
  const id = req.params.id;
  try {
    // const page = parseInt(req.query.page) || 1; // default to page 1
    // const limit = parseInt(req.query.limit) || 50; // default to 10 items per page
    const newUsers = await User.find({ eventId: id }).populate("eventId");

    // If page and limit are provided, paginate the results
    // const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;
    // const resultData = newUsers.slice(startIndex, endIndex);

    const results = {
      totalUsers: newUsers.length,
      // currentPage: page,
      // totalPages: Math.ceil(resultData.length / limit),
      data: newUsers,
    };
    res.status(200).json({ message: "All Event User", results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    // const newUsers = await User.find({}).populate("eventId");

    // const checkInStudent = newUsers.filter((user) => user.checkIn);

    // const eventId = await User.aggregate([
    //   {
    //     $group: {
    //       _id: "$eventId",
    //       totalStudents: { $sum: 1 },
    //       checkInStudents: {
    //         $sum: {
    //           $cond: [{ $eq: ["$checkIn", true] }, 1, 0],
    //         },
    //       },
    //     },
    //   },
    // ]);

    // const eventId = await User.aggregate([
    //   {
    //     $project: {
    //       eventId: 1,
    //       checkIn: 1,
    //       memberCount: {
    //         $cond: {
    //           if: { $gt: [{ $size: { $ifNull: ["$member", []] } }, 0] },
    //           then: { $add: [{ $size: "$member" }, 1] },
    //           else: 1,
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$eventId",
    //       totalStudents: { $sum: 1 },
    //       checkInStudents: {
    //         $sum: {
    //           $cond: [{ $eq: ["$checkIn", true] }, "$memberCount", 0],
    //         },
    //       },
    //     },
    //   },
    // ]);

    const eventId = await User.aggregate([
      {
        $project: {
          eventId: 1,
          checkIn: 1,
          memberCount: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$checkIn", true] },
                  { $gt: [{ $size: { $ifNull: ["$member", []] } }, 0] },
                ],
              },
              then: { $add: [{ $size: "$member" }, 1] }, // members + user
              else: {
                $cond: {
                  if: { $eq: ["$checkIn", true] },
                  then: 1, // only user
                  else: 0,
                },
              },
            },
          },
          checkInFlag: {
            $cond: [{ $eq: ["$checkIn", true] }, 1, 0],
          },
        },
      },
      {
        $group: {
          _id: "$eventId",
          totalStudents: { $sum: 1 }, // all users
          checkInStudents: { $sum: "$checkInFlag" }, // only check-in users
          totalMember: { $sum: "$memberCount" }, // members + user, only for check-ins
        },
      },
    ]);

    // const results = {
    //   // totalStudents: newUsers.length,
    //   // totalChackIn: checkInStudent.length,
    //   // totalStudent: newUsers,
    // };
    res
      .status(200)
      .json({ message: "all students information", events: eventId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendTicket = async (req, res) => {
  const id = req.params.id;
  try {
    const newUser = await User.findById(id).populate("eventId");
    if (!newUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // const startD = newUser.eventId.startDate.toLocaleString("en-In", {
    //   timeZone: "Asia/Kolkata",
    //   year: "numeric",
    //   month: "short",
    //   day: "2-digit",
    // });

    const formattedDate = new Date(
      newUser.eventId.startDate
    ).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const userData = {
      gmail: newUser.email,
      number: newUser.number,
      name: newUser.name,
      eventShortName: newUser.eventId.eventShortName,
      eventName: newUser.eventId.eventName,
      startDate: `${formattedDate} ${newUser.eventId.startTime}`, //to ${populatedUser.eventId.endTime})`,
      venue: newUser.eventId.venue,
      link: newUser.url,
    };

    const emaildata = nodeEmailFunction(userData);
    const numberData = whatsappAPi(userData);

    res.status(200).json({ message: "Ticket resend successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addUrl = async (req, res) => {
  const id = req.params.id;
  const { url } = req.body;
  try {
    const newUser = await User.findByIdAndUpdate(id, { url });
    console.log("hello", newUser);
    res.status(201).json({ message: "message user url update", newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "user Not Found" });
    }
    res.status(200).json({ message: "User delete successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTicketByNumber = async (req, res) => {
  try {
    const { eventId, number } = req.body;
    if (!eventId || !number) {
      return res.status(400).json({
        error: "missing field required",
        message: {
          eventId: !eventId ? "eventId is required" : undefined,
          number: !number ? "number is required" : undefined,
        },
      });
    }
    const newUser = await User.findOne({ eventId, number })
      .select("name checkIn eventId") // only select 'name', 'checkIn', and 'eventId' from user
      .populate({
        path: "eventId",
        select: "eventName startDate startTime venue", // only select these fields from Event
      });
    if (!newUser) {
      return res.status(404).json({ message: "user not found in DB" });
    }
    res.status(200).json({ message: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addUser,
  checkInUser,
  getAllStudents,
  getAllStudentByEvent,
  getStatus,
  resendTicket,
  addUrl,
  deleteUser,
  getTicketByNumber,
  directLogin,
};
