const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const allFileTypes = ["image/png", "image/jpeg", "image/jpg"];
const pdfOnlyType = ["application/pdf"];

const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(`Only ${allowedTypes.join(", ")} files are allowed!`),
        false
      );
    }
  };
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter(allFileTypes), // 👈 Pass the correct filter here
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
