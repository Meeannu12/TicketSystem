const express = require("express");
const {
  createQRCode,
  redirectURL,
} = require("../controller/qrcodeLink.controller");
const linkRoute = express.Router();

linkRoute.post("/createQRCode", createQRCode);
linkRoute.get("/redirectURL/:id", redirectURL);

module.exports = linkRoute;
