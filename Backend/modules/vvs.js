const vvsModule = {};

const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const type_of = object => Object.prototype.toString.call(object).slice(8, -1).toLowerCase();
const request = require('axios');
const User = require("./user");
const moment = require('moment');
const reverseGeocoder = require('./reverseGeocoder');
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


vvsModule.getLastPossibleConnectionStartTime = function(eventStartTime, eventLocation) {
	logger.trace("vvs.js - getLastPossibleConnectionStartTime - start");
	return new Promise((resolve, reject) => {
		getUsersCurrentAddressFromUserPreferences()
			.then((address) => {
				parameters.name_origin = address;
				parameters.name_destination = eventLocation;

				const event = moment(eventStartTime);
				parameters.itdDate = event.format(dateFormat);
				parameters.itdTime = event.format(timeFormat);
				// console.log(parameters);
			})
			.then(() => request.get(vvsUrl, { params: parameters}))
			.then((response) => {
				const trips = response.data.trips;

				let tripInfo;
				switch(type_of(trips)) {
					case 'array':
						tripInfo = trips[0];
						break;
					case 'object':
						tripInfo = trips.trip;
						break;
					default:
						return reject(new Error('Error retrieving trip information'));
				}
				logger.trace('vvs.js - getLastPossibleConnectionStartTime: trip duration = ' + tripInfo.duration);
				const startDateTimeObject = tripInfo.legs[0].points[0].dateTime;
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
				if (preferences.currentLocationCoordinates !== undefined && preferences.currentLocationCoordinates !== "") {
					return reverseGeocoder.getStreetFromCoordinates(preferences.currentLocationCoordinates)
						.then((address) => resolve(address))
						.catch((error) => reject(error));
					// resolve(preferences.currentLocationAddress);
				}
				reject(new Error('Couldn\'t load current location address'));
			})
			.catch((error) => reject(error))
			.finally(() => logger.trace("vvs.js - getUsersCurrentAddressFromUserPreferences - finally"));
	});
}

/*
function getEventAddressFromUserPreferences() {
	logger.trace("vvs.js - getEventAddressFromUserPreferences - start");
	return new Promise((resolve, reject) => {
		User.getUserPreferences()
			.then((preferences) => {
				if (preferences.eventLocationCoordinates !== undefined && preferences.eventLocationCoordinates !== "") {
					setTimeout(() => {
						return reverseGeocoder.getStreetFromCoordinates(preferences.eventLocationCoordinates)
							.then((address) => resolve(address))
							.catch((error) => reject(error));
						// return resolve(preferences.eventLocationAddress);
					}, 1000);
				} else reject(new Error('Couldn\'t load events location address'));
			})
			.catch((error) => reject(error))
			.finally(() => logger.trace("vvs.js - getEventAddressFromUserPreferences - finally"));
	});
}
*/

module.exports = vvsModule;
logger.debug("vvsModule initialized");