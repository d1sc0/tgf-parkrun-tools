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
const filepath = './_Experiments/list.csv';
const athletes = [];

// authenticate and grab eventDetails (to get total events count) and then process results
Parkrun.auth(userName, password, async function (client, err) {
  if (!err) {
    fs.createReadStream(filepath)
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

  const getAthleteLimited = limiter(async athlete => {
    await client.getAthlete(athlete.athleteID).then(res => {
      athlete.athleteHomeID = res._homeRun._id;
      athlete.athleteHomeName = res._homeRun._name;
      console.log(athlete);
    });
  }, 1000);

  athletes.forEach(async athlete => {
    getAthleteLimited(athlete);
  });

  //take athletes array and write back out to csv
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
