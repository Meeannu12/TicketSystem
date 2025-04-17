const express = require("express");
const { addAdmin, loginAdmin } = require("../controller/admin.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/authmiddleware");
const adminRoute = express.Router();

adminRoute.post("/register", addAdmin);
adminRoute.post("/login", loginAdmin);
adminRoute.get("/", authMiddleware, adminMiddleware, (req, res) => {
  res.status(200).json("data get successful");
});

module.exports = adminRoute;
