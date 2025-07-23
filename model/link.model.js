const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    qr: String,
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Link", LinkSchema);
