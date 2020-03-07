const vvsModule = {};

const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const request = require('axios');
const User = require("./user");
const moment = require('moment');
const vvsUrl = 'http://efastatic.vvs.de/vvs/XML_TRIP_REQUEST2';
const parameters = {
	'locationServerActive': 1,
	'outputFormat': 'json',

	'type_origin': 'any',
	'name_origin': 5000322,
	'anyObjFilter_origin': 0,

	'type_destination': 'any',
	'name_destination': 5006056,
	'anyObjFilter_dest': 0,

	'ptOptionsActive': 1,
	'useProxFootSearchOrigin': 1,
	'calcNumberOfTrips': 1,
	'changeSpeed': 'slow',

	'itdDate': 20200307,
	'itdTime': 1440,
	'itdTripDateTimeDepArr': 'arr'
};
const dateFormat = 'YYYYMMDD';
const timeFormat = 'HHmm';


vvsModule.getLastPossibleConnectionStartTime = function(eventStartTime) {
	logger.trace("vvs.js - getLastPossibleConnectionStartTime - start");
	return new Promise((resolve, reject) => {
		Promise.all([getUsersCurrentAddressFromUserPreferences(), getEventAddressFromUserPreferences()])
			.then((addresses) => {
				parameters.name_origin = addresses[0];
				parameters.name_destination = addresses[1];

				const event = moment(eventStartTime);
				parameters.itdDate = event.format(dateFormat);
				parameters.itdTime = event.format(timeFormat);
			})
			.then(() => request.get(vvsUrl, { params: parameters}))
			.then((response) => {
				const trips = response.data.trips;
				if (trips == null || trips.trip == null) return reject(new Error('Error retrieving trip information'));
				const startDateTimeObject = trips.trip.legs[0].points[0].dateTime;
				const startTime = moment(startDateTimeObject.date + " " + startDateTimeObject.time, 'DD.MM.YYYY HH:mm');
				resolve(startTime);
			})
			.catch((error) => {
				logger.error(error);
				reject(error);
			})
			.finally(() => logger.trace("vvs.js - getLastPossibleConnectionStartTime - finally"));
	});
};

function getUsersCurrentAddressFromUserPreferences() {
	logger.trace("vvs.js - getUsersCurrentAddressFromUserPreferences - start");
	return new Promise((resolve, reject) => {
		User.getUserPreferences()
			.then((preferences) => {
				if (preferences.currentLocationAddress !== undefined && preferences.currentLocationAddress !== "") return resolve(preferences.currentLocationAddress);
				reject(new Error('Couldn\'t load current location address'));
			})
			.catch((error) => reject(error))
			.finally(() => logger.trace("vvs.js - getUsersCurrentAddressFromUserPreferences - finally"));
	});
}

function getEventAddressFromUserPreferences() {
	logger.trace("vvs.js - getEventAddressFromUserPreferences - start");
	return new Promise((resolve, reject) => {
		User.getUserPreferences()
			.then((preferences) => {
				if (preferences.eventLocationAddress !== undefined && preferences.eventLocationAddress !== "") return resolve(preferences.eventLocationAddress);
				reject(new Error('Couldn\'t load events location address'));
			})
			.catch((error) => reject(error))
			.finally(() => logger.trace("vvs.js - getEventAddressFromUserPreferences - finally"));
	});
}

module.exports = vvsModule;
logger.debug("vvsModule initialized");