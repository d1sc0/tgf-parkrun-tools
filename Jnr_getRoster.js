const fs = require('fs');
const Parkrun = require('tweaked_parkrun_js');
const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
dotenv.config();

// set required values from .env
const userName = process.env.JUNAME;
const password = process.env.JPWORD;
const parkrunEventId = process.env.JEVENTID;

//create outputs folders
const volResults = './_JnrRosters';
if (!fs.existsSync(volResults)) {
  fs.mkdirSync(volResults);
}

// authenticate and grab eventDetails (to get total events count) and then process results
Parkrun.auth(userName, password, function (client, err) {
  if (!err) {
    getParkrunEvent(client).then(eventDetails => {
      processVolunteers(eventDetails._totalEvents, client);
    });
  } else console.log(err);
});

// process All results
async function processVolunteers(totalEvents, client) {
  // grab the event number from node CLI parameter
  let eventNum = process.argv[2];
  eventDate = await getResultData(eventNum);
  const [day, month, year] = eventDate.split('/');
  const eventDateStr = [year, month, day].join('');
  const eventDateStr2 = [year, month, day].join('-');
  await getRosterDetails(
    client,
    eventDate,
    eventDateStr,
    eventDateStr2,
    eventNum
  ).then(rosterRows => {
    writeCsv('/JTGF-volunteers-' + eventNum, rosterRows);
  });
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
  eventNum
) {
  rosterRows = client.getRoster(parkrunEventId, eventDateStr).then(roster => {
    const data = [
      ...roster.map(item => [
        eventNum,
        eventDateStr2,
        item._athleteFirstName,
        item._athleteLastName,
        item._athleteID,
        'https://www.parkrun.org.uk/thegreatfield-juniors/parkrunner/' +
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
async function getResultData(eventNum) {
  try {
    const response = await axios.get(
      'https://www.parkrun.org.uk/thegreatfield-juniors/results/' + eventNum,
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
