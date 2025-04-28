const { default: axios } = require("axios");

async function whatsappAPi(data) {
  // console.log("whatsappAPi", data);
  try {
    const response = await axios.post(process.env.WHATSAPP_API, {
      type: "richTemplate",
      templateId: "seminar_ug_25_dl", //templateId: "neet_expo_25"
      templateLanguage: "en",
      file_name: `${data.name}`,
      templateArgs: [
        `${data.link}`,
        `${data.name}`,
        `Attend INDIA'S Mega Event on ${data.eventShortName}`,
        // `${data.eventName}`,
        `${data.startDate}`,
        `${data.venue}`,
        `${data.link}`,
      ],
      sender_phone: `${data.number}`,
    });
    // console.log("whatsapp response", response.data);
    return response.data;
  } catch (error) {
    console.log("Error", error.message);
  }
}

module.exports = whatsappAPi;
