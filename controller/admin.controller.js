const Admin = require("../model/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerToWebinar } = require("../config/zoomFunction");
const { ZoomWhatsappApi } = require("../config/whatsappAPI");
const { default: axios } = require("axios");

const addAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "missing fields required",
        message: {
          name: !name ? "name is required" : undefined,
          email: !email ? "email is required" : undefined,
          password: !password ? "password is required" : undefined,
        },
      });
    }

    const admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: "email already exist in DB" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      name,
      email,
      password: hashPassword,
      role: role ? role : "user",
    });
    await newAdmin.save();

    res.status(201).json({ message: "register successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    // console.log("Login Data", employeeId, password);
    if (!employeeId || !password) {
      return res.status(400).json({
        error: "missing fields required",
        message: {
          employeeId: !employeeId ? "employeeId is required" : undefined,
          password: !password ? "password is required" : undefined,
        },
      });
    }

    const response = await axios.post(process.env.LOGIN_API, {
      employeeId,
      password,
    });
    // console.log(response.data, response);

    const verifyToken = jwt.verify(
      response.data.token,
      process.env.ZOOM_JWT_SECRET
    );
    // console.log(verifyToken);
    if (verifyToken.staffAccess.ticketingSystem) {
      return res.status(403).json({ message: "You are blocked by Admin" });
    }
    const payload = {
      staffId: verifyToken.staffId,
      staffRole: verifyToken.staffRole,
      staffAccess: verifyToken.staffAccess.ticketingSystem,
      staff: verifyToken.staff,
      employeeId: verifyToken.employeeId,
    };

    // console.log("payload", payload);

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    res.status(200).json({
      message: "login Successful",
      token,
      role: verifyToken.staffRole,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.response?.data?.message ||
        error.message ||
        "Internal Server Error",
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const getUser = await Admin.find({});
    const newUser = getUser.filter((user) => user.role == "user");
    res.status(200).json({ message: "get all User", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deleteUser = await Admin.findByIdAndDelete(id);
    if (!deleteUser) {
      return res.status(404).json({ message: "user Not Found" });
    }
    res.status(200).json({ message: "User delete successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create a zoom meet api's

const zoomRegistration = async (req, res) => {
  try {
    const {
      webinarId,
      email,
      firstName,
      lastName,
      phoneNumber,
      city,
      state,
      parentNumber,
      registeredBy,
    } = req.body;

    const data = {
      webinarId,
      email,
      firstName,
      lastName,
      phoneNumber,
      city,
      state,
      parentNumber,
      registeredBy,
    };
    // const ZoomAPI = await callZoomAPI(data);
    const ZoomAPI = await registerToWebinar(data);
    if (ZoomAPI.status == 429) {
      return res
        .status(429)
        .json({ message: "You have exceeded the daily rate limit of (3)" });
    }

    const start = new Date(ZoomAPI.start_time);

    const startDate = start.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long", // monday , tuesday
      year: "numeric", // 2024, 2025....
      month: "long", // Jan, Feb, etc.
      day: "numeric", // 01, 02, ..., 31
      hour: "numeric", // 01, 02, ..., 12
      minute: "2-digit", // 00, 15, 30, ...
      hour12: true, // Shows AM/PM
    });
    // console.log("date", startDate);
    // console.log("zoom Data", { ...ZoomAPI, ...data, startDate });
    const zoomData = { ...ZoomAPI, ...data, startDate };
    const whatsAppApi = ZoomWhatsappApi(zoomData);
    // console.log("whatsapp response", whatsAppApi);
    res.status(201).json({ message: "Your webinar seat is booked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addAdmin,
  loginAdmin,
  deleteUser,
  getAllUser,
  zoomRegistration,
};
