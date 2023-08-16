const fs = require('fs');
const { parse } = require('csv-parse');
const Parkrun = require('tweaked_parkrun_js');
// const { countries } = require('./location_data/countries_data.js');
const { events } = require('./location_data/event_data.js');
const dotenv = require('dotenv');
dotenv.config();

// set required values from .env
const userName = process.env.UNAME;
const password = process.env.PWORD;

//set values
const filepath = './_Experiments/';
const filename = 'list.csv';
const outputname = 'tgf_AthleteSummary.csv';
const eventNum = 2927; //TGF parkrun event ID
const athletes = [];

// authenticate and grab eventDetails (to get total events count) and then process results
Parkrun.auth(userName, password, async function (client, err) {
  if (!err) {
    fs.createReadStream(filepath + filename)
      .pipe(
        parse({
          delimiter: ',',
          columns: true,
          ltrim: true,
        })
      )
      .on('data', function (row) {
        // This will push the object row into the array
        athletes.push(row);
      })
      .on('error', function (error) {
        console.log(error.message);
      })
      .on('end', function () {
        // do stuff with the data, in another function
        processDetails(athletes, client);
      });
  } else console.log(err);
});

function processDetails(athletes, client) {
  console.log('parsed csv data:');
  athletesNew = [];
  let i = 1;
  const getAthleteLimited = limiter(async athlete => {
    await client.getAthlete(athlete.athleteID).then(async res => {
      athlete.athleteHomeID = res._homeRun._id;
      athlete.athleteHomeName = res._homeRun._name;
      const byId = item => item.id === athlete.athleteHomeID;
      if (events.find(byId)) {
        athlete.athleteHomeGeoLon = events.find(byId).geometry.coordinates[0];
        athlete.athleteHomeGeoLat = events.find(byId).geometry.coordinates[1];
        athlete.athleteHomeCountry = events.find(byId).properties.countrycode;
      } else {
        athlete.athleteHomeGeoLat = null;
        athlete.athleteHomeGeoLon = null;
        athlete.athleteHomeCountry = null;
      }

      athlete.athleteFullName = await res.getFullName();
      TGFcountsObj = await res.getTGFCounts(eventNum);
      countsObj = await res.getCounts();
      athlete.athleteTGFrunCount = TGFcountsObj.TGFrunCount;
      athlete.athleteTGFvolCount = TGFcountsObj.TGFvolCount;
      athlete.athleteRunCount = countsObj.runCount;
      athlete.athleteVolCount = countsObj.volCount;

      athletesNew.push(athlete);
      console.log(i);
      if (i === athletes.length) {
        //console.log(athletesNew);
        writeCSV(athletesNew);
      }
      i++;
    });
  }, 500);

  athletes.forEach(async athlete => {
    getAthleteLimited(athlete);
  });
}

function limiter(fn, wait) {
  let isCalled = false,
    calls = [];

  let caller = function () {
    if (calls.length && !isCalled) {
      isCalled = true;
      calls.shift().call();
      setTimeout(function () {
        isCalled = false;
        caller();
      }, wait);
    }
  };

  return function () {
    calls.push(fn.bind(this, ...arguments));
    // let args = Array.prototype.slice.call(arguments);
    // calls.push(fn.bind.apply(fn, [this].concat(args)));

    caller();
  };
}

function writeCSV(athletesNew) {
  //take athletes object and turn into an array then write back out to csv
  const athletesCSV = [
    [
      'ID',
      'FullName',
      'HomeID',
      'HomeName',
      'HomeGeoLon',
      'HomeGeoLat',
      'HomeCountry',
      'RunCount',
      'VolCount',
      'TGFRunCount',
      'TGFVolCount',
    ],
    ...athletesNew.map(athlete => [
      athlete.athleteID,
      athlete.athleteFullName,
      athlete.athleteHomeID,
      athlete.athleteHomeName,
      athlete.athleteHomeGeoLon,
      athlete.athleteHomeGeoLat,
      athlete.athleteHomeCountry,
      athlete.athleteRunCount,
      athlete.athleteVolCount,
      athlete.athleteTGFrunCount,
      athlete.athleteTGFvolCount,
    ]),
  ]
    .map(e => e.join(','))
    .join('\n');

  //console.log(athletesCSV);
  fs.writeFile(filepath + outputname, athletesCSV, err => {
    console.log(err || 'homeruns.csv created successfully!');
  });
}
