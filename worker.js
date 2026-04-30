// worker.js

require("dotenv").config(); // 👈 ADD THIS AT TOP

const db = require("./config/db");


console.log("🚀 Worker starting...");

require("./workers/resend.worker");
// import your worker logic
// require("./src/workers/resend.worker.js");

// 👇 connect DB first
db();

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});

