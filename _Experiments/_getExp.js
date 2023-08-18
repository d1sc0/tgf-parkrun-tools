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
const eventNum = 2927; //TGF parkrun event ID
const athletes = [633637];

// authenticate and grab eventDetails (to get total events count) and then process results
Parkrun.auth(userName, password, async function (client, err) {
  if (!err) {
    processDetails(athletes, client);
  } else console.log(err);
});

function processDetails(athletes, client) {
  athletesNew = [];
  let i = 1;

  const getAthleteLimited = limiter(async athlete => {
    await client.getAthlete(athlete.athleteID).then(async res => {
      athlete.athleteFullName = await res.getFullName();
      TGFcountsObj = await res.getTGFCounts(eventNum);
      athlete.athleteTGFrunCount = TGFcountsObj.TGFrunCount;
      athlete.athleteTGFvolCount = TGFcountsObj.TGFvolCount;

      athletesNew.push(athlete);
      console.log(i, athlete);
      if (i === athletes.length) {
        console.log(athletesNew);
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
