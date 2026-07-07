const express = require("express");
const {
  addEvent,
  getEventById,
  getAllEvent,
  editEvent,
  reUploadEventImageById,
  getAllEventByAdmin,
  deleteEvent,
  getAllLiveEvent,
  getAllLiveEventforLMS,
  getallEventcity,
  getAllEventbycity,
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
  "/updateImage/:id",
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
// eventRoute.get("/getEvent", getAllEvent);

eventRoute.get("/getAllLiveEvent", getAllLiveEvent);

eventRoute.get("/getAllLiveEventforLMS", getAllLiveEventforLMS)

//delete event by id
eventRoute.delete(
  "/deleteEvent/:id",
  authMiddleware,
  adminMiddleware,
  deleteEvent
);

eventRoute.get('/getallEventcity', getallEventcity)
eventRoute.get('/getallLiveEventBycity/:city', getAllEventbycity)


module.exports = eventRoute;
