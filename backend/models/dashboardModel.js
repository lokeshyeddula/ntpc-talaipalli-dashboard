const axios = require('axios');


function parseGoogleDate(str) {
  if (!str || !str.startsWith('Date(')) return null;

  const values = str
    .replace('Date(', '')
    .replace(')', '')
    .split(',')
    .map(Number);


  const year = values[0];
  const month = values[1];
  const day = values[2];
  const hour = values[3] || 0;
  const minute = values[4] || 0;
  const second = values[5] || 0;

  return new Date(year, month, day, hour, minute, second);
}


function toISTDateTimeString(dateObj) {
  if (!dateObj) return '';


  const istOffset = 5.5 * 60;
  const utcTime = dateObj.getTime();
  const istTime = utcTime + (istOffset * 60 * 1000);

  const istDate = new Date(istTime);


  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const hour = String(istDate.getHours()).padStart(2, '0');
  const minute = String(istDate.getMinutes()).padStart(2, '0');
  const second = String(istDate.getSeconds()).padStart(2, '0');


  const timePeriod = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour > 12 ? hour - 12 : hour;


  const fullTimestamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;


  const date = `${year}-${month}-${day}`;
  const time = `${formattedHour}:${minute}:${second} ${timePeriod}`;

  return {
    fullTimestamp,
    date,
    time
  };
}

async function fetchGoogleSheetData() {
  const url = 'https://docs.google.com/spreadsheets/d/1kqgfwULYDz-M4lK_rTBLrDtsN3ASL5Dztrtutf-oSEg/gviz/tq?tqx=out:json&gid=0';

  try {
    const response = await axios.get(url);
    const rawData = response.data;
    const jsonData = JSON.parse(rawData.substring(47).slice(0, -2));

    const rows = jsonData.table.rows.map(row => {
      const timestamp = row.c[0]?.v || '';
      const date = row.c[1]?.v || '';
      const timeOfObservation = row.c[2]?.v || '';

      const formattedTimestamp = toISTDateTimeString(parseGoogleDate(timestamp));
      const formattedDate = toISTDateTimeString(parseGoogleDate(date));
      const formattedTimeOfObservation = toISTDateTimeString(parseGoogleDate(timeOfObservation));

      return {
        Timestamp: formattedTimestamp.fullTimestamp,
        Date: formattedDate.date,
        Time_of_Observation: formattedTimeOfObservation.time,
        Pit: row.c[3]?.v || '',
        Observed_during: row.c[4]?.v || '',
        Name_of_Observer: row.c[5]?.v || '',
        Designation_of_Observer: row.c[6]?.v || '',
        Relay: row.c[7]?.v || '',
        Contact_Number: row.c[8]?.v || '',
      };
    });

    return rows;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

module.exports = { fetchGoogleSheetData };
