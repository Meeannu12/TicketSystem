const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const adminRoute = require("./routes/admin.route");
const eventRoute = require("./routes/event.routes");
const userRoutes = require("./routes/user.route");
const path = require("path");

const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://event.neetadvisor.in"], // Include all frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    exposedHeaders: ["Content-Disposition", "Content-Type", "Content-Length"], // Important for file downloads
    maxAge: 600, // Cache preflight requests
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
db();

// This serves files from "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const api = process.env.API;

app.get(`${api}`, (req, res) => {
  res.status(200).json({ message: "Api run successful" });
});
app.use(`${api}/admin`, adminRoute);
app.use(`${api}/event`, eventRoute);
app.use(`${api}/ticket`, userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
