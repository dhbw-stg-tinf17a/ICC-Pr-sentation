const router = require('express').Router();
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const Weather = require('../modules/weather');

/** ********************
 * Get the current weather information
 ********************* */
router.get('/', (req, res) => {
  logger.trace('router - weather - GET called on /');
  Weather.getCurrentWeatherForUserLocation()
    .then((weather) => res.status(200).send({ status: 200, data: weather }))
    .catch((error) => res.status(500).send({ status: 500, error: error.message }));
});

router.get('/:city', (req, res) => {
  logger.trace('router - weather - GET called on /:city');
  Weather.getCurrentWeatherForCity(req.params.city)
    .then((weather) => res.status(200).send({ status: 200, data: weather }))
    .catch((error) => res.status(500).send({ status: 500, error: error.message }));
});

module.exports = router;
