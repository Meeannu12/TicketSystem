const express = require("express");
const { addAdmin, loginAdmin } = require("../controller/admin.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authmiddleware");
const adminRoute = express.Router();

adminRoute.post("/register", authMiddleware, adminMiddleware, addAdmin);
adminRoute.post("/login", loginAdmin);

module.exports = adminRoute;
