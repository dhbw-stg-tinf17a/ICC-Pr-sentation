const express = require('express');
const pino = require('pino');

const router = express.Router();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

router.use('/', (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

router.use('/user', require('./user'));
router.use('/quote', require('./quote'));
router.use('/places', require('./place'));

router.use('/notifications', require('./notifications'));
router.use('/morning-routine', require('./morning-routine'));
router.use('/travel-planning', require('./travel-planning'));

module.exports = router;
