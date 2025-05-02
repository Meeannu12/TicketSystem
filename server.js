const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
require("./auth/google"); // Passport config
const adminRoute = require("./routes/admin.route");
const eventRoute = require("./routes/event.routes");
const userRoutes = require("./routes/user.route");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://event.neetadvisor.in",
      "http://192.168.0.26:5173",
    ], // Include all frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    exposedHeaders: ["Content-Disposition", "Content-Type", "Content-Length"], // Important for file downloads
    maxAge: 600, // Cache preflight requests
  })
);
app.enable("trust proxy"); // important!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
db();

// This serves files from "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Folder where PDFs are uploaded
const uploadFolder = path.join(__dirname, "uploads");

// Endpoint to check and download PDF
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadFolder, `ticket_${filename}.pdf`);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: "File not found" });
    }

    // If the file exists, send it for download
    res.download(filePath, (downloadError) => {
      if (downloadError) {
        return res.status(500).json({ error: "Failed to download file" });
      }
    });
  });
});

const api = process.env.API;

// app.get(`${api}`, (req, res) => {
//   res.status(200).json({ message: "Api run successful" });
// });
app.use(`${api}/admin`, adminRoute);
app.use(`${api}/event`, eventRoute);
app.use(`${api}/ticket`, userRoutes);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get(`${api}`, (req, res) => {
  res.send(`<a href= ${api}/auth/google >Login with Google</a>`);
});

app.get(
  `${api}/auth/google`,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  `${api}/auth/google/callback`,
  passport.authenticate("google", {
    successRedirect: `${api}/profile`,
    failureRedirect: "/",
  })
);

// app.get("/profile", (req, res) => {
//   if (!req.isAuthenticated()) return res.redirect("/");
//   res.send(`Welcome ${req.user.displayName}`);
// });

app.get(`${api}/profile`, (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");
  res.send(`
    <h1>Welcome ${req.user.displayName}</h1>
    <a href= ${api}/logout >Logout</a>
  `);
});

app.get(`${api}/logout`, (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(); // clear session from server
    res.clearCookie("connect.sid"); // Optional: clear session cookie
    // req.session.destroy(); // Optional: destroy session on server
    res.redirect(`${api}`); // Redirect to homepage or login page
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
