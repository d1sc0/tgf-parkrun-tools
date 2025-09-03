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
const runResults = './_Latest';
if (!fs.existsSync(runResults)) {
  fs.mkdirSync(runResults);
}

// authenticate and grab eventDetails (to get total events count)
Parkrun.auth(userName, password, function (client, err) {
  if (!err) {
    getParkrunEvent(client).then(eventDetails => {
      // console.log(eventDetails);
      processResults(eventDetails._totalEvents);
    });
  } else console.log(err);
});

// process All results
async function processResults(totalEvents) {
  let allResults = [];
  let eventNum = totalEvents;
  await getResultData(eventNum).then(data => {
    const resultRows = processEvent(data);
    allResults = allResults.concat(resultRows);
    if (allResults.length > 0) {
      console.log('Run stats for event ' + eventNum + ' successfully parsed!');
    } else console.log('error parsing junior run result');
  });
  writeCsv('/JTGF-latest-results', allResults);
}

// function to write the finished file
function writeCsv(title, rows) {
  //add the row headers for results
  rows.unshift([
    'eventNumber',
    'eventDate',
    'finishPos',
    'finishTime',
    'athleteName',
    'athleteID',
    'eventAchievement',
    'sex',
    'sexFinishPos',
    'club',
    'ageGroup',
    'numRuns',
    'numVol',
    'ageGrade',
    'athleteURL',
  ]);

  fs.writeFile(runResults + title + '.csv', rows.join('\r\n'), err => {
    console.log(err || runResults + title + '.csv created successfully!');
  });
}

// go and get the EventDetails
async function getParkrunEvent(client) {
  const eventDetails = await client.getEvent(parkrunEventId);
  return eventDetails;
}

// scrape data for single event
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
    return data;
  } catch (err) {
    console.log(err); // TypeError: failed to fetch
  }
}

//process individual result file
function processEvent(data) {
  //parse the html to grab the
  const resultRows = [];
  const $eventHTML = data('body');
  const $rows = $eventHTML.find('table tr');
  const eDate = $eventHTML.find('.Results-header .format-date').text();
  eventYear = eDate.substring(6, 10);
  eventMonth = eDate.substring(3, 5);
  eventDay = eDate.substring(0, 2);
  const eventDate = eventYear + '-' + eventMonth + '-' + eventDay;
  const eventNum = $eventHTML.find('.Results-header h3 span:eq(2)').text();
  const eventNumber = eventNum.replace(/\D+/g, '');

  //set values for each table results row
  $rows.each(function (i, item) {
    runnerFinishPos = data(item).attr('data-position');
    runnerName = data(item).attr('data-name');
    runnerTime = data(item).find('.Results-table-td--time .compact').text();
    runnerClub = data(item).attr('data-club') || 'null';
    runnerClub = runnerClub.replace(/,/g, '');
    runnerAgeGroup = data(item).attr('data-agegroup');
    runnerSex = data(item).attr('data-gender');
    runnerNoRuns = data(item).attr('data-runs');
    runnerNoVols = data(item).attr('data-vols');
    runnerAgeGrade = data(item).attr('data-agegrade');
    runnerAchievement = data(item).attr('data-achievement') || 'null';
    runnerLink = data(item).find('.Results-table-td--name div a');
    runnerURL = runnerLink.attr('href') || 'null';

    //correct time format for hh:mm:ss.mse
    if (runnerTime.length < 6) {
      runnerTime = '00:' + runnerTime;
    }
    //runnerTime = runnerTime + '.000';
    a = runnerTime.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];

    runnerTime = seconds;

    //set runnerID by removing everything but digits, also handle unknowns
    if (typeof runnerURL !== 'null') {
      runnerID = runnerURL.replace(/\D+/, '');
      // Removes a trailing slash if present
      runnerID = runnerID.replace(/\/$/, '');
    }

    //null values for unknowns
    if (runnerName == 'Unknown') {
      runnerTime = '';
      runnerSex = 'Unknown';
      runnerAgeGroup = 'Unknown';
      runnerNoRuns = '';
      runnerNoVols = '';
      runnerAgeGrade = '';
      runnerID = '';
      runnerURL = 'Unknown';
      runnderSexPos = 'Unknown';
    } else {
      // position
      runnerSexPos = data(item)
        .find('.Results-table-td--gender :not(.compact)')
        .text();
      runnerSexPos = runnerSexPos.replace(/\D+/, '');
    }

    // Swapping gender for Sex (as is used in age groups)
    if (runnerSex == 'Male') {
      runnerSex = 'M';
    }
    if (runnerSex == 'Female') {
      runnerSex = 'W';
    }
    // fix odd runner URL issue present from run 199 onwards
    runnerURL = 'https://www.parkrun.org.uk' + runnerURL;
    // create an array of results
    //add data to a csv row
    result = [
      eventNumber,
      eventDate,
      runnerFinishPos,
      runnerTime,
      runnerName,
      runnerID,
      runnerAchievement,
      runnerSex,
      runnerSexPos,
      runnerClub,
      runnerAgeGroup,
      runnerNoRuns,
      runnerNoVols,
      runnerAgeGrade,
      runnerURL,
    ];
    if (i >= 1) {
      resultRows.push(result.join(','));
    }
  });
  //end items loops
  return resultRows;
}
