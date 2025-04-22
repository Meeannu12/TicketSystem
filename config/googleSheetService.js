const { google } = require("googleapis");
// const credentials = require("./starry_expanse_428911_a5_c1774a3026b2.json");
require("dotenv").config();

const credentials = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  // private_key: process.env.PRIVATE_KEY,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),

  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// const sheets = google.sheets({ version: "v4", auth });
async function getSheetsClient() {
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient });
}

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

async function readSheet(range = "Sheet2!A1:Z100") {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  return res.data.values;
}

async function appendRow(data, range = "Sheet2") {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "RAW",
    resource: {
      values: [data],
    },
  });
  return res;
}

async function updateRow(row, data) {
  const sheets = await getSheetsClient();
  const range = `Sheet1!A${row}:Z${row}`;
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "RAW",
    resource: {
      values: [data],
    },
  });
  return res;
}

async function clearRow(row) {
  const sheets = await getSheetsClient();
  const range = `Sheet1!A${row}:Z${row}`;
  const res = await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  return res;
}

// async function readSheet(range = "Sheet2!A1:Z100") {
//   const res = await sheets.spreadsheets.values.get({
//     spreadsheetId: SPREADSHEET_ID,
//     range,
//   });
//   return res.data.values;
// }

// async function appendRow(data, range = "Sheet2") {
//   const res = await sheets.spreadsheets.values.append({
//     spreadsheetId: SPREADSHEET_ID,
//     range,
//     valueInputOption: "RAW",
//     resource: {
//       values: [data],
//     },
//   });
//   return res;
// }

// async function updateRow(row, data) {
//   const range = `Sheet1!A${row}:Z${row}`;
//   const res = await sheets.spreadsheets.values.update({
//     spreadsheetId: SPREADSHEET_ID,
//     range,
//     valueInputOption: "RAW",
//     resource: {
//       values: [data],
//     },
//   });
//   return res;
// }

// async function clearRow(row) {
//   const range = `Sheet1!A${row}:Z${row}`;
//   const res = await sheets.spreadsheets.values.clear({
//     spreadsheetId: SPREADSHEET_ID,
//     range,
//   });
//   return res;
// }

module.exports = {
  readSheet,
  appendRow,
  updateRow,
  clearRow,
};
