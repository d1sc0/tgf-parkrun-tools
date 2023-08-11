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
node getRunResultAll.js
```

This will create one a single CSV file containing a merged file with all results in a folder called '\_Results'.

To do the same for volunteers in a folder called '\_Rosters'

from terminal run...

```
node getRosterAll.js
```

or for both ...

```
npm run update_stats
```

To just get individual event .csv and not produce the all file run the following passing in the event number e.g.

```
node getRunResult.js 88
node getRoster.js 88
```

## Edit: Adding Juniors

A quick and dirty duplication of scripts to parse results for Juniors

requires additional env parameters

```
 JUNAME=username // parkrun username
 JPWORD=password // parkrun password
 JEVENTID=3095 //parkrun event ID (can be obtained from parkrun wiki)
```

and folders '\_JnrResults' and '\_JnrRosters'

Scripts run same as above but will be run as

```
node Jnr_getRosterAll.js
node Jnr_getRunResultAll.js
```

For single collated files or 'npm run update_jnr_stats' for both.

For individual files as below passing event number as a param.

```
node Jnr_getRoster.js 48
node Jnr_getRunResult.js 48
```

To get latest roster and results for both events run

```
npm run getLatest
```

To upload to bigQuery

```
npm run uploadLatest
```

you can upload a specific result to BQ (to solve issues) with the following

```
node loadRoster2BQ.js 88
node loadRun2BQ.js 88
node loadJnrRun2BQ.js 48
node loadJnrRoster2BQ.js 48
```
