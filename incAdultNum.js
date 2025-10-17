const fs = require('fs');

const latestEventNums = readJsonSync('eventNums.json', {});
const adultEventNum = latestEventNums.adultEventNum;
const junEventNum = latestEventNums.junEventNum;
//update eventNums.json to next event number
const UpdateEventNumbers = {
  adultEventNum: adultEventNum + 1,
  junEventNum: junEventNum,
};
writeJsonSync('eventNums.json', UpdateEventNumbers);

function writeJsonSync(filePath, data) {
  const tmp = `${filePath}.tmp`;
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(tmp, json, 'utf8'); // write to temp file
  fs.renameSync(tmp, filePath); // atomic-ish replace
}

function readJsonSync(filePath, defaultValue = null) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(txt);
  } catch (err) {
    if (err.code === 'ENOENT') return defaultValue; // missing file
    throw err; // rethrow parse or other errors
  }
}
