const fs = require('fs');
const Parkrun = require('tweaked_parkrun_js');
const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
dotenv.config();

// set required values from .env
const userName = process.env.UNAME;
const password = process.env.PWORD;
const parkrunEventId = process.env.EVENTID;

//create outputs folders
const volResults = './_Latest';
if (!fs.existsSync(volResults)) {
  fs.mkdirSync(volResults);
}

// get latest event numbers from eventNums.json
const latestEventNums = readJsonSync('eventNums.json', {});
const adultEventNum = latestEventNums.adultEventNum;
const junEventNum = latestEventNums.junEventNum;

// authenticate and grab eventDetails (to get total events count) and then process results
Parkrun.auth(userName, password, function (client, err) {
  if (!err) {
    getParkrunEvent(client).then(eventDetails => {
      processVolunteers(client).then(allResults => {
        writeCsv('/TGF-latest-roster', allResults);
      });
    });
  } else console.log(err);
});

// process All results
async function processVolunteers(client) {
  let allResults = [];
  //loop through event until you hit total events
  eventDate = await getResultData(adultEventNum);
  const [day, month, year] = eventDate.split('/');
  const eventDateStr = [year, month, day].join('');
  const eventDateStr2 = [year, month, day].join('-');
  await getRosterDetails(
    client,
    eventDate,
    eventDateStr,
    eventDateStr2,
    adultEventNum
  ).then(rosterRows => {
    allResults = allResults.concat(rosterRows);
    //writeCsv('/TGF-volunteers-' + eventNum, rosterRows);
    console.log(
      'Volunteer stats for event ' + adultEventNum + ' successfully parsed!'
    );
  });

  return allResults;
}
// function to write the finished file
function writeCsv(title, rows) {
  //add the row headers for results
  rows.unshift([
    '_eventNumber',
    '_eventDate',
    '_athleteFirstName',
    '_athleteLastName',
    '_athleteID',
    '_athleteUrl',
    '_taskID',
    '_taskName',
  ]);

  fs.writeFile(volResults + title + '.csv', rows.join('\r\n'), err => {
    console.log(err || volResults + title + '.csv created successfully!');
  });
}

// go and get the EventDetails
async function getParkrunEvent(client) {
  const eventDetails = await client.getEvent(parkrunEventId);
  return eventDetails;
}

async function getRosterDetails(
  client,
  eventDate,
  eventDateStr,
  eventDateStr2,
  adultEventNum
) {
  rosterRows = client
    .getRoster(parkrunEventId, eventDateStr, eventDateStr2)
    .then(roster => {
      const data = [
        ...roster.map(item => [
          adultEventNum,
          eventDateStr2,
          item._athleteFirstName,
          item._athleteLastName,
          item._athleteID,
          'https://www.parkrun.org.uk/thegreatfield/parkrunner/' +
            item._athleteID,
          item._taskID,
          item._taskName,
        ]),
      ];
      return data;
    });
  return rosterRows;
}

// scrape website data for dates
async function getResultData(adultEventNum) {
  try {
    const response = await axios.get(
      'https://www.parkrun.org.uk/thegreatfield/results/' + adultEventNum,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
          'Content-Type': 'text/plain;charset=utf-8',
        },
      }
    );
    // parse the html text and extract titles
    const data = cheerio.load(response.data);
    const $eventHTML = data('body');
    const eventDateStr = $eventHTML.find('.Results-header .format-date').text();
    //return eventDate;
    return eventDateStr;
  } catch (err) {
    console.log(err); // TypeError: failed to fetch
  }
}

function writeJsonSync(filePath, data) {
  const tmp = `${filePath}.tmp`;
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(tmp, json, 'utf8'); // write to temp file
  fs.renameSync(tmp, filePath); // atomic-ish replace
}

function readJsonSync(filePath, defaultValue = null) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(txt);
  } catch (err) {
    if (err.code === 'ENOENT') return defaultValue; // missing file
    throw err; // rethrow parse or other errors
  }
}
