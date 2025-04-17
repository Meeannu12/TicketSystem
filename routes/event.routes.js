const express = require("express");
const { addEvent, getEventById, getAllEvent } = require("../controller/event.controller");

const eventRoute = express.Router();

eventRoute.post("/addEvent", addEvent);
eventRoute.get("/getEvent/:id", getEventById);
eventRoute.get("/getEvent", getAllEvent);

module.exports = eventRoute;
