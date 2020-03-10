const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const request = require('axios');

const reverseGeocoderModule = {};
const reverseGeocodeUrl = 'https://nominatim.openstreetmap.org/reverse';

const reverseGeocodeParams = {
	format: 'jsonv2',
	lat: 0,
	lon: 0,
};

reverseGeocoderModule.getStreetFromCoordinates = (coordinates) => {
	logger.trace('reverseGeocoderModule - getStreetFromCoordinates - start');
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
				logger.trace(`reverseGeocoderModule - getStreetFromCoordinates: Reverse geocoded ${coordinates} to: ${address}`);
				resolve(address);
			})
			.catch((error) => reject(error))
			.finally(() => logger.trace('reverseGeocoderModule - getStreetFromCoordinates - finally'));
	});
};

reverseGeocoderModule.getAreaFromCoordinates = (coordinates) => {
	logger.trace('reverseGeocoderModule - getAreaFromCoordinates - start');
	return new Promise((resolve, reject) => {
		const latlngStr = coordinates.split(',', 2);
		reverseGeocodeParams.lat = parseFloat(latlngStr[0]);
		reverseGeocodeParams.lon = parseFloat(latlngStr[1]);
		request.get(reverseGeocodeUrl, { params: reverseGeocodeParams })
			.then((reverseGeocodeReturn) => {
				const addressObject = reverseGeocodeReturn.data.address;
				const area = addressObject.suburb || addressObject.city_district || addressObject.postcode || addressObject.city || addressObject.county;
				logger.trace(`reverseGeocoderModule - getAreaFromCoordinates: Reverse geocoded ${coordinates} to: ${area}`);
				resolve(area);
			})
			.catch((error) => reject(error))
			.finally(() => logger.trace('reverseGeocoderModule - getAreaFromCoordinates - finally'));
	});
};


module.exports = reverseGeocoderModule;
logger.debug('reverseGeocoderModule initialized');
