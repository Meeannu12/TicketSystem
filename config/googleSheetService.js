const { google } = require("googleapis");
const credentials = require("./starry_expanse_428911_a5_c1774a3026b2.json");
require("dotenv").config();

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

async function readSheet(range = "Sheet2!A1:Z100") {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  return res.data.values;
}

async function appendRow(data, range = "Sheet2") {
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
  const range = `Sheet1!A${row}:Z${row}`;
  const res = await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  return res;
}

module.exports = {
  readSheet,
  appendRow,
  updateRow,
  clearRow,
};
