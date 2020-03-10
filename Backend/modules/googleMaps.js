const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const GoogleMapsClient = require('@googlemaps/google-maps-services-js').Client;

const googleMapsModule = {};

// Initiate new maps Client
const mapsClient = new GoogleMapsClient({});

googleMapsModule.getStreetFromCoordinates = (coordinates) => {
  logger.trace('googleMaps.js - getStreetFromCoordinates - start');
  return new Promise((resolve, reject) => {
    const latlngStr = coordinates.split(',', 2);
    const coordinatesObject = {
      lat: parseFloat(latlngStr[0]),
      lng: parseFloat(latlngStr[1]),
    };

    mapsClient.reverseGeocode({
      params: {
        key: process.env.GOOGLE_MAPS_API_KEY,
        language: 'de',
        latlng: coordinatesObject,
        result_type: ['street_address'],
      },
    })
      .then((response) => {
        const result = response.data.results[0];
        logger.trace(`google result for address: ${result}`);
        const address = result.formatted_address;
        resolve(address);
      })
      .catch((error) => {
        logger.error(error);
        reject(new Error('Google Maps Error'));
      });
  });
};


module.exports = googleMapsModule;
logger.debug('googleMapsModule initialized');
