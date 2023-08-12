const fs = require('fs');
const { parse } = require('csv-parse');
const Parkrun = require('tweaked_parkrun_js');
const dotenv = require('dotenv');
dotenv.config();

// set required values from .env
const userName = process.env.UNAME;
const password = process.env.PWORD;
const athleteID = 3751343;

//set values
const filepath = './_Experiments/';
const filename = 'shortlist.csv';
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
    await client.getAthlete(athlete.athleteID).then(res => {
      athlete.athleteHomeID = res._homeRun._id;
      athlete.athleteHomeName = res._homeRun._name;
      athletesNew.push(athlete);
      console.log(i);
      if (i === athletes.length) {
        //console.log(athletesNew);
        writeCSV(athletesNew);
      }
      i++;
    });
  }, 1000);

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
    ['athleteID', 'TGFeventCount', 'athleteHomeID', 'athleteHomeName'],
    ...athletesNew.map(athlete => [
      athlete.athleteID,
      athlete.TGFeventCount,
      athlete.athleteHomeID,
      athlete.athleteHomeName,
    ]),
  ]
    .map(e => e.join(','))
    .join('\n');

  console.log(athletesCSV);
  fs.writeFile(filepath + 'homeruns.csv', athletesCSV, err => {
    console.log(err || 'homeruns.csv created successfully!');
  });
}
