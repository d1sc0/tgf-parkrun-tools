// Import the Google Cloud client libraries
const { BigQuery } = require('@google-cloud/bigquery');
require('dotenv').config();

async function loadLatest() {
  const creds = JSON.parse(process.env.GA_CREDS || {});
  const bigquery = new BigQuery({
    projectId: creds.project_id,
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key,
    },
  });
  let eventNum = process.argv[2];
  const filename = '_JnrRosters/JTGF-volunteers-' + eventNum + '.csv';
  const datasetId = 'eventStats';
  const tableId = 'jnrVolRosters';
  const metadata = {
    sourceFormat: 'CSV',
    skipLeadingRows: 1,
    // Set the write disposition to overwrite existing table data.
    //writeDisposition: 'WRITE_TRUNCATE',
    location: 'europe-west9',
  };

  // Load data from a Google Cloud Storage file into the table
  const [job] = await bigquery
    .dataset(datasetId)
    .table(tableId)
    .load(filename, metadata);
  // load() waits for the job to finish
  console.log(`Job ${job.id} completed.`);

  // Check the job's status for errors
  const errors = job.status.errors;
  if (errors && errors.length > 0) {
    throw errors;
  }
}

loadLatest();
