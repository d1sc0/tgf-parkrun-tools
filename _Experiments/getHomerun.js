const fs = require('fs');
const Parkrun = require('tweaked_parkrun_js');
const dotenv = require('dotenv');
dotenv.config();

// set required values from .env
const userName = process.env.UNAME;
const password = process.env.PWORD;
const athleteID = 645983;
// authenticate and grab eventDetails (to get total events count) and then process results
Parkrun.auth(userName, password, async function (client, err) {
  if (!err) {
    await client.getAthleteDetails(athleteID).then(athlete => {
      console.log(athlete);
    });
  } else console.log(err);
});
