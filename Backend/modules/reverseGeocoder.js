const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const request = require('axios');

const reverseGeocoderModule = {};
const reverseGeocodeUrl = 'https://nominatim.openstreetmap.org/reverse';

const reverseGeocodeParams = {
  format: 'jsonv2',
  lat: 0,
  lon: 0,
};

reverseGeocoderModule.getStreetFromCoordinates = async (coordinates) => {
  logger.trace('reverseGeocoderModule - getStreetFromCoordinates - called');
  const latlngStr = coordinates.split(',', 2);
  reverseGeocodeParams.lat = parseFloat(latlngStr[0]);
  reverseGeocodeParams.lon = parseFloat(latlngStr[1]);

  const geocodeResponse = await request.get(reverseGeocodeUrl, { params: reverseGeocodeParams });

  const addressObject = geocodeResponse.data.address;
  const houseNumber = addressObject.house_number || '';
  const street = addressObject.road || addressObject.pedestrian;
  const { city } = addressObject;

  const address = `${city}, ${street} ${houseNumber}`;
  logger.trace(`reverseGeocoderModule - getStreetFromCoordinates: Reverse geocoded ${coordinates} to: ${address}`);
  return address;
};

reverseGeocoderModule.getAreaFromCoordinates = async (coordinates) => {
  logger.trace('reverseGeocoderModule - getAreaFromCoordinates - called');
  const latlngStr = coordinates.split(',', 2);
  reverseGeocodeParams.lat = parseFloat(latlngStr[0]);
  reverseGeocodeParams.lon = parseFloat(latlngStr[1]);

  const geocodeResponse = await request.get(reverseGeocodeUrl, { params: reverseGeocodeParams });

  const addr = geocodeResponse.data.address;
  const area = addr.suburb || addr.city_district || addr.postcode || addr.city || addr.county;
  logger.trace(`reverseGeocoderModule - getAreaFromCoordinates: Reverse geocoded ${coordinates} to: ${area}`);
  return area;
};


module.exports = reverseGeocoderModule;
logger.debug('reverseGeocoderModule initialized');
