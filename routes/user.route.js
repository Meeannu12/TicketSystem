const express = require("express");
const addUser = require("../controller/user.controller");

const userRoutes = express.Router();

userRoutes.post("/createTicket/:id", addUser);

module.exports = userRoutes;
