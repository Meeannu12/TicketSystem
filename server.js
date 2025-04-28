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
    origin: [
      "http://localhost:5173",
      "https://event.neetadvisor.in",
      "http://192.168.1.178:5173",
    ], // Include all frontend URLs
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

// Suppose user sends request like /download?userId=123
app.get('/download/:id', (req, res) => {
  const id = req.params.id; // You get user ID from query

  // Find file based on user ID (you can use DB, or map manually)
  // For example, assume each user's file is named as userId.pdf
  const filePath = path.join(__dirname, 'uploads', `${id}.pdf`);

  // Send the file
  res.download(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Could not download file.');
    }
  });
});

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
