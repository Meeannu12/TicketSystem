const express = require("express");
const {
  addAdmin,
  loginAdmin,
  getAllUser,
  deleteUser,
  zoomRegistration,
} = require("../controller/admin.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authmiddleware");
const adminRoute = express.Router();

adminRoute.post("/register", authMiddleware, adminMiddleware, addAdmin);
adminRoute.post("/login", loginAdmin);
adminRoute.get("/getUser", authMiddleware, adminMiddleware, getAllUser);
adminRoute.delete(
  "/deleteUser/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);

// zoom api call here
// adminRoute.post("/zoomRegistration", zoomRegistration);

module.exports = adminRoute;
