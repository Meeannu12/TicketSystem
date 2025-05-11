const express = require("express");
const {
  addEvent,
  getEventById,
  getAllEvent,
  editEvent,
  reUploadEventImageById,
  getAllEventByAdmin,
} = require("../controller/event.controller");
const upload = require("../config/multer");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authmiddleware");

const eventRoute = express.Router();

eventRoute.post(
  "/addEvent",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  addEvent
);
eventRoute.put(
  "/updateImage",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  reUploadEventImageById
);
eventRoute.put("/editEvent", authMiddleware, adminMiddleware, editEvent);
eventRoute.get(
  "/getAllEventByAdmin",
  authMiddleware,
  adminMiddleware,
  getAllEventByAdmin
);
eventRoute.get("/getEvent/:id", getEventById);
eventRoute.get("/getEvent", getAllEvent);

module.exports = eventRoute;
