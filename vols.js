const fs = require('fs');
const Parkrun = require('tweaked_parkrun_js');
const dotenv = require('dotenv');
dotenv.config();

Parkrun.auth(process.env.UNAME, process.env.PWORD, function (client, err) {
  if (!err) {
    const eventDetails = client.getRoster(
      process.env.EVENTID,
      process.env.EVENTDATE
    );
    eventDetails.then(roster => {
      const rosterCsv = [
        [
          '_eventNumber',
          '_eventDate',
          '_athleteID',
          '_taskID',
          '_rosterID',
          '_taskName',
          '_athleteFirstName',
          '_athleteLastName',
        ],
        ...roster.map(item => [
          item._eventNumber,
          item._eventDate,
          item._athleteID,
          item._taskID,
          item._rosterID,
          item._taskName,
          item._athleteFirstName,
          item._athleteLastName,
        ]),
      ]
        .map(e => e.join(','))
        .join('\n');

      // write out a file
      fs.writeFile(
        './outputs/roster' + process.env.EVENTDATE + '.csv',
        rosterCsv,
        err => {
          console.log(
            err ||
              './outputs/roster' +
                process.env.EVENTDATE +
                '.csv created successfully!'
          );
        }
      );
    });
  } else console.log(err);
});
