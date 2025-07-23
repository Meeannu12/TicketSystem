const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema({
  name: String,
  url: String,
});

module.exports = mongoose.model("Link", LinkSchema);
