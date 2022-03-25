# The Great Field parkrun stats tools

## to-do list

- update script to use copy of tweaked parkrun.js API implementation - done
- turn object array into csv - done
- simplify, work on creating a single file per event (using a parameter)
- maybe re-create for results

## to use

1. npm install
2. create a foler in app root called 'outputs'
3. create a .env file at root with following params
   ```
    UNAME=username // parkrun username
    PWORD=password // parkrun password
    EVENTID=2927 //parkrun event ID (can be obtained from parkrun wiki)
    EVENTDATE=20211030 // date you want to process
   ```

run...

```
node vols.js
```

will create roster20211030.csv in .outputs/
