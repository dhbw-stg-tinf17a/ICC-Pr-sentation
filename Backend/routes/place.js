const router = require('express').Router();
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const placesModule = require('../modules/places');

/** ********************
 * Show the restaurants near a user's location
 ********************* */
router.get('/restaurants', (req, res) => {
  logger.trace('router - place - GET called on /restaurants');

  placesModule.getRestaurantsNearUser()
    .then((restaurants) => res.status(200).send({ status: 200, data: restaurants }))
    .catch((error) => res.status(500).send({ status: 500, error }))
    .finally(() => logger.trace('router - places/restaurants - responded'));
});

module.exports = router;
