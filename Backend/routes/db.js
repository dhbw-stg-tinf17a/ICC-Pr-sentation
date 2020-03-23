const router = require('express').Router();
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const db = require('../modules/db');

router.get('/connections', async (req, res) => {
  try {
    const connections = await db.getConnections({
      start: '8000105',
      destination: '8011160',
      datetime: '2020-04-10T22:00:00Z',
    });
    res.send(connections);
  } catch (err) {
    logger.error(err, '/api/db/connections - Error occurred');
    res.status(500).send({ error: err.message });
  }
});

router.get('/station', async (req, res) => {
  const id = '8000105';
  const station = await db.getStationByID(id);
  if (station === null) {
    res.status(404).send({ error: `Station ${id} not found` });
    return;
  }

  res.send(station);
});

module.exports = router;
