const router = require('express').Router();
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const db = require('../modules/db');

router.get('/', async (req, res) => {
  try {
    const data = await db.getConnections({
      start: '8000105',
      destination: '8011160',
      date: new Date(),
    });
    res.send(data);
  } catch (err) {
    logger.error(err, '/api/db/ - Error occurred');
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
