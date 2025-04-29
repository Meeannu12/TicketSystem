const express = require("express");
const {
  addAdmin,
  loginAdmin,
  getAllUser,
  deleteUser,
} = require("../controller/admin.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authmiddleware");
const adminRoute = express.Router();

adminRoute.post("/register", authMiddleware, adminMiddleware, addAdmin);
adminRoute.post("/login", loginAdmin);
adminRoute.get("/getUser", authMiddleware, adminMiddleware, getAllUser);
adminRoute.get("/deleteUser/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = adminRoute;
