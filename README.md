# The Great Field parkrun stats tools

This is a hobby project to grab some event results and volunteers stats for TGF parkrun ready for some analysis.

## To-do

Try and get Github actions working with Fetch or Axios so can automate on schedule

## Grab all results and completed volunteers rosters for an event as .csv

1. clone the repo and CD into the project folder
2. run - npm install
3. create a .env file at root with following params
   ```
    UNAME=username // parkrun username
    PWORD=password // parkrun password
    EVENTID=2927 //parkrun event ID (can be obtained from parkrun wiki)
   ```

from terminal run...

```
node allRunResults.js
```

This will create one a single CSV file containing a merged file with all results.

To do the same for volunteers in a folder called '\_completedRosters'

from terminal run...

```
node allRosters.js
```

or for both ...

```
npm run update_stats
```

To just get individual event .csv and not produce the all file run the following passing in the event number e.g.

```
node getRunResult.js 14
```

or

```
node getRoster.js 14
```

## So long and thanks for all the fish
