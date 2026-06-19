const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const adminRoute = require("./routes/admin.route");
const eventRoute = require("./routes/event.routes");
const userRoutes = require("./routes/user.route");
// const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const linkRoute = require("./routes/link.route");
const { showDynamicTicket } = require("./controller/user.controller");
const { tryCatch } = require("bullmq");
require("dotenv").config();
// const Events = require("./model/event");

const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://neetexpo.com",
      "https://www.neetexpo.com",
      "http://192.168.0.26:5173",
      "https://neet-exam-guidelines.vercel.app",
      "https://webinar-registration-puce.vercel.app",
      "https://expo.neetadvisor.in",
      "https://lms.neetadvisor.in"
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

// EJS Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static Files
app.use(express.static("public"));

// This serves files from "uploads" folder
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/uploads/:id",extractTicketId, showDynamicTicket);

// Folder where PDFs are uploaded
const uploadFolder = path.join(__dirname, "uploads");

// Endpoint to check and download PDF
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename; 12
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


app.get("/showDynamicTicket/:id", showDynamicTicket)

const api = process.env.API;

app.get(`${api}`, (req, res) => {
  res.status(200).json({ message: "Api run successful" });
});
app.use(`${api}/admin`, adminRoute);
app.use(`${api}/event`, eventRoute);
app.use(`${api}/ticket`, userRoutes);
app.use(`${api}/link`, linkRoute);

// app.get("/downloadSheet/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const data = await Events.findById(id);
//     // Convert data to worksheet
//     const worksheet = XLSX.utils.json_to_sheet(data);

//     // Create workbook and add the worksheet
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");

//     // Define file path
//     const filePath = path.join(__dirname, "attendees.xlsx");

//     // Write the Excel file
//     XLSX.writeFile(workbook, filePath);

//     // Send file to client
//     res.download(filePath, "attendees.xlsx", (err) => {
//       if (err) {
//         console.error("Download error", err);
//       } else {
//         // Delete file after download if needed
//         fs.unlinkSync(filePath);
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Something went wrong while exporting" });
//   }
// });

const extractTicketId = (
  req,
  res,
  next
) => {
  const { id } = req.params;

  // ticket_6a252ffad8aae07b3c1fb99d.pdf
  const ticketId = id.replace("ticket_", "").replace(".pdf", "");

  req.params.id = ticketId;

  next();
};

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
