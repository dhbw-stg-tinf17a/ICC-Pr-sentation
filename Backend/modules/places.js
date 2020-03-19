const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const request = require('axios');
const reverseGeocoder = require('./reverseGeocoder');
const User = require('./user');

const searchUrl = 'https://nominatim.openstreetmap.org/search/';
const placesModule = {};


placesModule.getRestaurantsNearUser = async () => {
  logger.trace('placesModule - getRestaurantsNearUser - start');

  const coordinates = await User.getUserCoordinates();
  const area = await reverseGeocoder.getAreaFromCoordinates(coordinates);
  const entries = await request.get(`${searchUrl}restaurant ${area}`, { params: { format: 'jsonv2' } });
  return entries.data.filter((entry) => entry.type === 'restaurant');
};

module.exports = placesModule;
logger.debug('placesModule initialized');
