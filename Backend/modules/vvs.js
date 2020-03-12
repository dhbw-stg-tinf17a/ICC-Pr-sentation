const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });

const vvsModule = {};

const typeOf = (object) => Object.prototype.toString.call(object).slice(8, -1).toLowerCase();
const request = require('axios');
const moment = require('moment');
const User = require('./user');
const reverseGeocoder = require('./reverseGeocoder');

const vvsUrl = 'http://efastatic.vvs.de/vvs/XML_TRIP_REQUEST2';
const parameters = {
  locationServerActive: 1,
  outputFormat: 'json',

  type_origin: 'any',
  name_origin: 5000322,
  anyObjFilter_origin: 0,

  type_destination: 'any',
  name_destination: 5006056,
  anyObjFilter_dest: 0,

  ptOptionsActive: 1,
  useProxFootSearchOrigin: 1,
  calcNumberOfTrips: 1,
  changeSpeed: 'slow',

  itdDate: 20200307,
  itdTime: 1440,
  itdTripDateTimeDepArr: 'arr',
};
const dateFormat = 'YYYYMMDD';
const timeFormat = 'HHmm';

function getUsersCurrentAddressFromUserPreferences() {
  logger.trace('vvs.js - getUsersCurrentAddressFromUserPreferences - start');
  return new Promise((resolve, reject) => {
    User.getUserPreferences()
      .then((preferences) => {
        if (preferences.currentLocationCoordinates !== undefined && preferences.currentLocationCoordinates !== '') {
          reverseGeocoder.getStreetFromCoordinates(preferences.currentLocationCoordinates)
            .then((address) => resolve(address))
            .catch((error) => reject(error));
          return;
          // resolve(preferences.currentLocationAddress);
        }
        reject(new Error('Couldn\'t load current location address'));
      })
      .catch((error) => reject(error))
      .finally(() => logger.trace('vvs.js - getUsersCurrentAddressFromUserPreferences - finally'));
  });
}

vvsModule.getLastConnectionStartTime = (eventStartTime, eventLocation) => {
  logger.trace('vvs.js - getLastConnectionStartTime - start');
  return new Promise((resolve, reject) => {
    getUsersCurrentAddressFromUserPreferences()
      .then((address) => {
        parameters.name_origin = address;
        parameters.name_destination = eventLocation;

        const event = moment(eventStartTime);
        parameters.itdDate = event.format(dateFormat);
        parameters.itdTime = event.format(timeFormat);
        parameters.itdTripDateTimeDepArr = 'arr';
      })
      .then(() => request.get(vvsUrl, { params: parameters }))
      .then((response) => {
        const { trips } = response.data;

        let tripInfo;
        switch (typeOf(trips)) {
          case 'array':
            [tripInfo] = trips;
            break;
          case 'object':
            tripInfo = trips.trip;
            break;
          default:
            reject(new Error('Error retrieving trip information'));
            return;
        }
        logger.trace(`vvs.js - getLastConnectionStartTime: trip duration = ${tripInfo.duration}`);
        const startDateTimeObject = tripInfo.legs[0].points[0].dateTime;
        const startTime = moment(`${startDateTimeObject.date} ${startDateTimeObject.time}`, 'DD.MM.YYYY HH:mm');
        resolve(startTime);
      })
      .catch((error) => {
        logger.error(error);
        reject(error);
      })
      .finally(() => logger.trace('vvs.js - getLastConnectionStartTime - finally'));
  });
};
vvsModule.getNextConnection = (startTime, startLocation, endLocation) => {
  logger.trace('vvs.js - getNextConnection - start');
  return new Promise((resolve, reject) => {
    parameters.name_origin = startLocation;
    parameters.name_destination = endLocation;

    const event = moment(startTime);
    parameters.itdDate = event.format(dateFormat);
    parameters.itdTime = event.format(timeFormat);
    parameters.itdTripDateTimeDepArr = 'dep';
    request.get(vvsUrl, { params: parameters })
      .then((response) => {
        const { trips } = response.data;

        let tripInfo;
        switch (typeOf(trips)) {
          case 'array':
            [tripInfo] = trips;
            break;
          case 'object':
            tripInfo = trips.trip;
            break;
          default:
            reject(new Error('Error retrieving trip information'));
            return;
        }

        logger.trace(`vvs.js - getNextConnection: trip duration = ${tripInfo.duration}`);
        const durationArray = tripInfo.duration.split(':', 2); // ['HH', 'mm']
        const tripPoints = [];
        tripInfo.legs.forEach((leg) => {
          leg.points.forEach((point) => {
            tripPoints.push({
              name: point.name,
              placeId: point.placeID,
              time: `${point.dateTime.date} ${point.dateTime.time}`,
            });
          });
        });
        const tripStartTime = moment(tripPoints[0].time, 'DD.MM.YYYY HH:mm');

        const trip = {
          duration: tripInfo.duration,
          startTime: tripStartTime.toISOString(true),
          arrivalTime: tripStartTime.add(durationArray[0], 'hours').add(durationArray[1], 'hours').toISOString(true),
          points: tripPoints,
        };
        resolve(trip);
      })
      .catch((error) => {
        logger.error(error);
        reject(error);
      })
      .finally(() => logger.trace('vvs.js - getNextConnection - finally'));
  });
};

/*
function getEventAddressFromUserPreferences() {
  logger.trace("vvs.js - getEventAddressFromUserPreferences - start");
  return new Promise((resolve, reject) => {
    User.getUserPreferences()
      .then((preferences) => {
        if (preferences.eventLocationCoordinates !== undefined &&
          preferences.eventLocationCoordinates !== "") {
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
logger.debug('vvsModule initialized');
