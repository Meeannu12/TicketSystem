const express = require("express");
const {
  addEvent,
  getEventById,
  getAllEvent,
  editEvent,
  reUploadEventImageById,
} = require("../controller/event.controller");
const upload = require("../config/multer");

const eventRoute = express.Router();

eventRoute.post("/addEvent", upload.single("image"), addEvent);
eventRoute.put("/updateImage", upload.single("image"), reUploadEventImageById);
eventRoute.put("/editEvent", editEvent);
eventRoute.get("/getEvent/:id", getEventById);
eventRoute.get("/getEvent", getAllEvent);

module.exports = eventRoute;
