const QRCode = require('qrcode');

// Function to generate QR
const generateQR = async (text) => {
  try {
    const qr = await QRCode.toDataURL(text); // Creates a base64 image
    console.log("QR Code (base64):");
    console.log(qr); // You can render this in frontend <img src="...">
  } catch (err) {
    console.error("Failed to generate QR", err);
  }
};

// Example usage
generateQR('hello bhupender');
