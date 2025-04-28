const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

async function nodeEmailFunction(data) {
  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: process.env.USER_GMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: {
      name: "Neet Advisor",
      address: process.env.USER_GMAIL,
    },
    to: data.gmail,
    subject: `${data.eventName}`,
    text: `Hi ${data.name},

Thank you for showing interest with us!

⏰Your event registration for ${data.eventName} is Confirmed.

✅ Topic- Attend INDIA'S Mega Event on ${data.eventShortName} 

🕦Date & Time:
${data.startDate}

🚨Venue:
${data.venue} 

🎁You can download your ticket by clicking on the below link.
${data.link}

For any help, Call at 8587888229
 

See you there!

Regards
NEET ADVISOR PVT. LTD.
🏆18+ Glorious Years of Excellence
Mumbai | Delhi | India
☎8587888229`,
  };
  transport.sendMail(mailOptions);
}

function otpGenerat() {
  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    digits: true,
    lowerCaseAlphabets: false,
  });
  return otp;
}

module.exports = { nodeEmailFunction, otpGenerat };
