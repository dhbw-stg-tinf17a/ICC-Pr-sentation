const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const request = require('axios');
const reverseGeocoder = require('./reverseGeocoder');
const User = require('./user');

const searchUrl = 'https://nominatim.openstreetmap.org/search/';
const placesModule = {};


placesModule.getRestaurantsNearUser = () => {
  logger.trace('placesModule - getRestaurantsNearUser - start');
  return new Promise((resolve, reject) => {
    User.getUserCoordinates()
      .then((coordinates) => reverseGeocoder.getAreaFromCoordinates(coordinates))
      .then((area) => request.get(`${searchUrl}restaurant ${area}`, { params: { format: 'jsonv2' } }))
      .then((entries) => entries.data.filter((entry) => entry.type === 'restaurant'))
      .then((restaurants) => resolve(restaurants))
      .catch((error) => reject(error))
      .finally(() => logger.trace('placesModule - getRestaurantsNearUser - finally'));
  });
};


module.exports = placesModule;
logger.debug('placesModule initialized');
