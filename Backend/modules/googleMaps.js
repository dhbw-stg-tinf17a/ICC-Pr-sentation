const googleMapsModule = {};

const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const request = require('axios');
const User = require("./user");


googleMapsModule.getStreetFromCoordinates = function(coordinates) {
	logger.trace("googleMaps.js - getStreetFromCoordinates - start");
	return new Promise((resolve, reject) => {
		reject(new Error('Not implemented yet'));
	});
};


module.exports = googleMapsModule;
logger.debug("googleMapsModule initialized");