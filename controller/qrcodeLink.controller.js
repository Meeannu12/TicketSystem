const QRCode = require("qrcode");
const Link = require("../model/link.model");

const createQRCode = async (req, res) => {
  const { name, url } = req.body;
  try {
    const newLink = await Link.create({ name, url });

    const redirectUrl = `https://vps.neetadvisor.in/api/v1/link/redirectURL/${newLink._id}`;

    const qr = await QRCode.toDataURL(redirectUrl); // QR image in Base64

    await Link.findByIdAndUpdate(newLink._id, { qr }, { new: true });

    res.json({
      shortUrl: redirectUrl,
      qrCode: qr,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const redirectURL = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).send("Link not found");
    }
    res.redirect(link.url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQRCode,
  redirectURL,
};
