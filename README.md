# The Great Field parkrun stats tools

## to-do list

- update script to use copy of tweaked parkrun.js - done
- simplify, work on creating a single file per event (using a parameter)
- turn array of objects into csv
- maybe recreate for results. Single script. event number and then events of results

## to use

1. npm install
2. create a foler in app root called 'outputs'
3. create a .env file at root with following params
   UNAME = parkrun username
   PWORD = parkrun password
   EVENTID = parkrun event ID (can be obtained from parkrun wiki)
