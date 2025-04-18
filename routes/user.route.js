const express = require("express");
const addUser = require("../controller/user.controller");

const userRoutes = express.Router();

userRoutes.post("/createTicket/:id", addUser);

userRoutes.get("/neet", (req, res) => {
  const {} = req.query;
  try {
    // 1. #CNUM# For Customer Number
    // 2. #VMN# For Virtual Number
    // 3. #START# For Call Start Time
    // 4. #END# For Call End Time
    // 5. #DURATION# For Call Duration
    // 6. #EXENO# For Executive Number
    // 7. #RFN# For Call Unique Reference Number
    // 8. #STAT# For Call Status
    // 8. #REC# For Recording File Name

    const callData = {};

    if (req.query.MOBILE) callData.customerNumber = req.query.MOBILE;
    if (req.query.VMN) callData.virtualNumber = req.query.VMN;
    if (req.query.TIME) callData.startTime = req.query.TIME;
    if (req.query.END) callData.endTime = req.query.END;
    if (req.query.DURATION) callData.duration = req.query.DURATION;
    if (req.query.EXENO) callData.executiveNumber = req.query.EXENO;
    if (req.query.RFN) callData.referenceNumber = req.query.RFN;
    if (req.query.STATUS) callData.status = req.query.STATUS;
    if (req.query.REC) callData.recording = req.query.REC;

    console.log("dataget", callData);

    res.status(200).json({
      message: "Received call data",
      data: callData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = userRoutes;
