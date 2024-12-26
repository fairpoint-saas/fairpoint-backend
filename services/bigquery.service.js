const { BigQuery } = require('@google-cloud/bigquery');

// Create a BigQuery client
const bigquery = new BigQuery({
  projectId: 'positive-cacao-445814-h5',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

async function getBigQueryData() {
  const query = 'SELECT * FROM `positive-cacao-445814-h5.positive_cacao_mern.gen_data` LIMIT 10';
  const options = {
    query: query,
    location: 'europe-west9',
  };

  try {
    // Run the query
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery query:', error);
    if (error.code === 404) {
      console.error('Dataset or table not found.');
    } else if (error.code === 403) {
      console.error('Access denied. Check your permissions.');
    }
    throw error;
  }
}

module.exports = {
  getBigQueryData,
};