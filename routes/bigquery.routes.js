const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/jwt.middleware');
const { getBigQueryData } = require('../services/bigquery.service');

router.get('/bigquery-data', isAuthenticated, async (req, res) => {
  try {
    const data = await getBigQueryData();
    res.json(data);
    console.log(data);
  } catch (error) {
    console.error('Error fetching data from BigQuery:', error);
    res.status(500).send('Error fetching data from BigQuery');
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.name === 'UnauthorizedError') {
    if (err.inner && err.inner.name === 'JsonWebTokenError') {
      res.status(401).send('Malformed token');
    } else {
      res.status(401).send('Invalid token');
    }
  } else {
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;