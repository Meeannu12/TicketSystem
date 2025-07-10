const { default: axios } = require("axios");

let zoomToken = null;
let tokenExpiry = 0;

const getZoomToken = async () => {
  const currentTime = Math.floor(Date.now() / 1000); // current time in seconds

  // Check if token is still valid
  if (zoomToken && currentTime < tokenExpiry) {
    return zoomToken;
  }
  try {
    // 1. Combine username and password with a colon
    const credentials = `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`;
    // const credentials = `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`;
    console.log("data log", credentials);

    // 2. Base64 encode the credentials
    const encodedCredentials = Buffer.from(credentials).toString("base64");

    // 3. Construct the Authorization header
    const authorizationHeader = `Basic ${encodedCredentials}`;
    const response = await fetch(
      //   `https://zoom.us/oauth/token?grant_type=client_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {
        method: "POST", // or 'GET', 'PUT', etc.
        headers: {
          Authorization: authorizationHeader,
          "Content-Type": "application/json", // Example: if sending JSON data
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Zoom API error: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    zoomToken = data.access_token;
    tokenExpiry = currentTime + data.expires_in - 60; // refresh 60 seconds early
    console.log("Zoom token refreshed");
    return zoomToken;
  } catch (error) {
    console.error(error.message);
  }
};

const registerToWebinar = async (data) => {
  const token = await getZoomToken();
  // console.log("token", token);
  const url = `https://api.zoom.us/v2/webinars/${data.webinarId}/registrants`;
  const webdata = {
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    city: data.city,
    phone: data.phoneNumber,
    custom_questions: [
      {
        title: "State",
        value: data.state,
      },
      {
        title: "Parent Number",
        value: data.parentNumber,
      },
      {
        title: "Registration Done by.",
        value: data.registeredBy,
      },
    ],
  };

  try {
    const response = await axios.post(url, webdata, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Zoom registration error:",
      error.response?.data || error.message
    );
    return error;
  }
};

module.exports = { registerToWebinar };
