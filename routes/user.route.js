const express = require("express");
const {
  addUser,
  checkInUser,
  getAllStudents,
  getStatus,
  resendTicket,
  addUrl,
  getAllStudentByEvent,
  deleteUser,
  checkEmail,
  addEmail,
  getTicketByNumber,
  directLogin,
} = require("../controller/user.controller");
const { appendRow } = require("../config/googleSheetService");
const {
  adminMiddleware,
  authMiddleware,
} = require("../middleware/authmiddleware");

const userRoutes = express.Router();
//create ticket api
userRoutes.post("/createTicket/:id", addUser);
// if add user id then user checkIn status Ture
userRoutes.post("/checkInUser", authMiddleware, checkInUser);
//if enter userId on pramas then show user details
userRoutes.get("/checkInStatus/:id", authMiddleware, getStatus);

userRoutes.post("/directLogin/:id", authMiddleware, directLogin);
//get all student add on single event
userRoutes.get(
  "/allStudent/:id",
  authMiddleware,
  adminMiddleware,
  getAllStudentByEvent
);

// get Ticket by number and eventId
userRoutes.post("/getTicketByNumber", authMiddleware, getTicketByNumber);

//get all student on every event
userRoutes.get("/allStudent", authMiddleware, getAllStudents);
// if again send ticket then use this api
userRoutes.get("/resendTicket/:id", authMiddleware, resendTicket);
// dummy api
userRoutes.post("/addUrl/:id", addUrl);
userRoutes.delete("/deleteStudent/:id", authMiddleware, deleteUser);

// crm data enter on google sheet

// userRoutes.get("/neet", async (req, res) => {
//   const {} = req.query;
//   try {
//     // 1. #CNUM# For Customer Number
//     // 2. #VMN# For Virtual Number
//     // 3. #START# For Call Start Time
//     // 4. #END# For Call End Time
//     // 5. #DURATION# For Call Duration
//     // 6. #EXENO# For Executive Number
//     // 7. #RFN# For Call Unique Reference Number
//     // 8. #STAT# For Call Status
//     // 8. #REC# For Recording File Name

//     const callData = {};

//     if (req.query.MOBILE) callData.customerNumber = req.query.MOBILE;
//     if (req.query.VMN) callData.virtualNumber = req.query.VMN;
//     if (req.query.TIME) callData.startTime = req.query.TIME;
//     if (req.query.END) callData.endTime = req.query.END;
//     if (req.query.DURATION) callData.duration = req.query.DURATION;
//     if (req.query.EXENO) callData.executiveNumber = req.query.EXENO;
//     if (req.query.RFN) callData.referenceNumber = req.query.RFN;
//     if (req.query.STATUS) callData.status = req.query.STATUS;
//     if (req.query.REC) callData.recording = req.query.REC;

//     const values = [
//       callData.customerNumber,
//       callData.virtualNumber,
//       callData.startTime,
//       callData.endTime,
//       callData.duration,
//       callData.executiveNumber,
//       callData.referenceNumber,
//       callData.status,
//       callData.recording,
//     ];

//     const dataAppend = await appendRow(values);
//     console.log("dataget", dataAppend);

//     res.status(200).json({
//       message: "Received call data",
//     });
//   } catch (error) {
//     console.log(error, error.message);
//     res.status(500).json({ message: error.message });
//   }
// });

module.exports = userRoutes;
