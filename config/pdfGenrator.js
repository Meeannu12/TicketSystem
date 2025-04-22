const PDFDocument = require("pdfkit");
const fs = require("fs");
const QRCode = require("qrcode");
const path = require("path");

// const ticketData = {
//   name: "Tanuj",
//   bookingId: "0fd7453406",
//   bookingDate: "August 10, 2024",
//   eventName:
//     "Mega Event on Maharashtra NEET PG 2024 MD / MS / DNB Admissions & Counselling Process / Cutoff / Fees",
//   eventDate: "August 15 (04:30 PM to 06:30 PM)",
//   ticketName: "Biggest Seminar Free Ticket",
//   location:
//     "Thakur College of Engineering and Technology, Thakur Road, Thakur Village, Kandivali East, Mumbai, Maharashtra, India",
// };

const uploadsDir = path.join(__dirname, "../uploads");
const assetsDir = path.join(__dirname, "./assets");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function generateTicketPDF(data) {
  const doc = new PDFDocument({
    size: [420, 350], // A5 width (420) x custom height (550)
    margin: 40,
  });

  const filePath = path.join(uploadsDir, `ticket_${data.bookingId}.pdf`);
  // const filePath = `../uploads/ticket_${data.bookingId}.pdf`;
  doc.pipe(fs.createWriteStream(filePath));

  // Generate QR Code
  const qrDataURL = await QRCode.toDataURL(data.bookingId);
  // const qrImage = qrDataURL.replace(/^data:image\/png;base64,/, "");
  const qrBuffer = Buffer.from(qrDataURL.split(",")[1], "base64");
  const qrPath = path.join(uploadsDir, `qr.png`);
  // const qrPath = `../uploads/qr.png`;
  fs.writeFileSync(qrPath, qrBuffer, "base64");
  // Header
  const leftX = 40;
  const rightX = doc.page.width - 150;

  doc.fontSize(10).fillColor("black");
  const formattedDate = new Date(data.bookingDate).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  // console.log("date", formattedDate);
  doc.text(`Booking Date: ${formattedDate}`, leftX, 40);
  doc.text(`Booking ID: ${data.bookingId}`, leftX, 55);
  // doc.image(qrPath, rightX, 10, { width: 130 });
  doc.image(qrBuffer, rightX, 10, { width: 130 });

  // Attendee Details
  doc.moveDown(2);
  doc.font("Helvetica-Bold").fontSize(13).text("Attendee Details", leftX);
  doc.font("Helvetica").fontSize(11).text(data.name, leftX);

  doc.moveDown(2);

  // Event Details
  doc.fontSize(10);

  doc.font("Helvetica-Bold").text("Event Name:", { continued: true });
  doc.font("Helvetica").text(` ${data.eventName}`, {
    width: doc.page.width - 80,
    lineGap: 2,
  });

  doc.moveDown(1);
  doc.font("Helvetica-Bold").text("Event Date:", { continued: true });
  doc.font("Helvetica").text(` ${data.eventDate}`);
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").text("Ticket Name:", { continued: true });
  doc.font("Helvetica").text(` ${data.ticketName}`);
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").text("Location:", { continued: true });
  doc
    .font("Helvetica")
    .fillColor("blue")
    .text(` ${data.location}`, {
      link: `${data.locationURL}`,
      underline: true,
      width: doc.page.width - 80,
    });
  // Add logo centered at bottom
  const logoPath = path.join(assetsDir, "Logo.png");
  // const logoPath = "./assets/Logo.png";
  const logoWidth = 120;
  const logoX = (doc.page.width - logoWidth) / 2;
  const logoY = doc.page.height - 110;

  doc.image(logoPath, logoX, logoY, { width: logoWidth });

  doc.end();
  const fileName = filePath.replace("/var/www/TicketSystem/uploads/", "");
  const protocol = data.req.protocol; // "http"
  const host = data.req.get("host"); // "localhost:3000"
  const fileURL = `${protocol}s://${host}/uploads/${fileName}`;
  // console.log("coustom URL", fileURL);
  return { fileURL, fileName };
}

// generateTicketPDF(ticketData);

module.exports = generateTicketPDF;
