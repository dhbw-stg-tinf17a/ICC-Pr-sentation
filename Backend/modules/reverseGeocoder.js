const pino = require('pino');
const axios = require('axios').default;

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const endpoint = 'https://nominatim.openstreetmap.org/reverse';

const reverseGeocodeParams = {
  format: 'jsonv2',
  lat: 0,
  lon: 0,
};

async function getStreetFromCoordinates(coordinates) {
  reverseGeocodeParams.lat = coordinates.lat;
  reverseGeocodeParams.lon = coordinates.lon;

  const geocodeResponse = await axios.get(endpoint, { params: reverseGeocodeParams });

  const addrObj = geocodeResponse.data.address;
  const houseNumber = addrObj.house_number || '';
  const city = addrObj.city || addrObj.suburb || addrObj.city_district || addrObj.county;
  const street = addrObj.road || addrObj.pedestrian;
  const address = `${city}, ${street} ${houseNumber}`;

  logger.trace(`reverseGeocoder.getStreetFromCoordinates: Reverse geocoded ${coordinates.lat}, ${coordinates.lon} to street ${address}`);

  return address;
}

async function getAreaFromCoordinates(coordinates) {
  reverseGeocodeParams.lat = coordinates.lat;
  reverseGeocodeParams.lon = coordinates.lon;

  const geocodeResponse = await axios.get(endpoint, { params: reverseGeocodeParams });
  const addr = geocodeResponse.data.address;
  const area = addr.suburb || addr.city_district || addr.postcode || addr.city || addr.county;

  logger.trace(`reverseGeocoder.getAreaFromCoordinates: Reverse geocoded ${coordinates.lat}, ${coordinates.lon} to area ${area}`);

  return area;
}


module.exports = { getStreetFromCoordinates, getAreaFromCoordinates };
