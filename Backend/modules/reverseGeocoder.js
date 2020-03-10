const reverseGeocoderModule = {};

const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const NodeGeocoder = require('node-geocoder');
const request = require('axios');
const User = require('./user');

const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  language: 'de',
});
const reverseGeocodeUrl = 'https://nominatim.openstreetmap.org/reverse';

const reverseGeocodeParams = {
  format: 'jsonv2',
  lat: 0,
  lon: 0,
};

reverseGeocoderModule.getStreetFromCoordinates = function (coordinates) {
  logger.trace('reverseGeocoder.js - getStreetFromCoordinates - start');
  return new Promise((resolve, reject) => {
    const latlngStr = coordinates.split(',', 2);
    reverseGeocodeParams.lat = parseFloat(latlngStr[0]);
    reverseGeocodeParams.lon = parseFloat(latlngStr[1]);
    request.get(reverseGeocodeUrl, { params: reverseGeocodeParams })
      .then((reverseGeocodeReturn) => {
        const addressObject = reverseGeocodeReturn.data.address;
        const houseNumber = addressObject.house_number || '';
        const street = addressObject.road || addressObject.pedestrian;
        const { city } = addressObject;
        // const postcode = addressObject.postcode;
        const address = `${city}, ${street} ${houseNumber}`;
        logger.trace(`reverseGeocoder.js - getStreetFromCoordinates: Reverse geocoded ${coordinates} to: ${address}`);
        resolve(address);
      })
      .catch((error) => reject(error))
      .finally(() => logger.trace('reverseGeocoder.js - getStreetFromCoordinates - finally'));
  });
};


module.exports = reverseGeocoderModule;
logger.debug('reverseGeocoderModule initialized');
