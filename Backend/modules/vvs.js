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

async function getUsersCurrentAddressFromUserPreferences() {
  logger.trace('vvsModule - getUsersCurrentAddressFromUserPreferences - called');
  const preferences = await User.getUserPreferences();

  if (preferences.currentLocationCoordinates && preferences.currentLocationCoordinates !== '') return reverseGeocoder.getStreetFromCoordinates(preferences.currentLocationCoordinates);
  throw new Error('Couldn\'t load current address from preferences');
}

vvsModule.getLastConnectionStartTime = async (eventStartTime, eventLocation) => {
  logger.trace('vvsModule - getLastConnectionStartTime - called');
  const address = await getUsersCurrentAddressFromUserPreferences();

  parameters.name_origin = address;
  parameters.name_destination = eventLocation;

  const event = moment(eventStartTime);
  parameters.itdDate = event.format(dateFormat);
  parameters.itdTime = event.format(timeFormat);
  parameters.itdTripDateTimeDepArr = 'arr';

  let vvsResponse;
  try {
    vvsResponse = await request.get(vvsUrl, { params: parameters });
  } catch (error) {
    throw new Error('There was an Error fetching the trip information from VVS');
  }

  const { trips } = vvsResponse.data;

  let tripInfo;
  switch (typeOf(trips)) {
    case 'array':
      [tripInfo] = trips;
      break;
    case 'object':
      tripInfo = trips.trip;
      break;
    default:
      throw new Error('Error retrieving trip information');
  }

  logger.trace(`vvsModule - getLastConnectionStartTime: trip duration = ${tripInfo.duration}`);
  const startDateTimeObject = tripInfo.legs[0].points[0].dateTime;
  const startTime = moment(`${startDateTimeObject.date} ${startDateTimeObject.time}`, 'DD.MM.YYYY HH:mm');
  return startTime;
};

vvsModule.getNextConnection = async (startTime, startLocation, endLocation) => {
  logger.trace('vvsModule - getNextConnection - called');
  parameters.name_origin = startLocation;
  parameters.name_destination = endLocation;

  const event = moment(startTime);
  parameters.itdDate = event.format(dateFormat);
  parameters.itdTime = event.format(timeFormat);
  parameters.itdTripDateTimeDepArr = 'dep';

  let vvsResponse;
  try {
    vvsResponse = await request.get(vvsUrl, { params: parameters });
  } catch (error) {
    throw new Error('There was an Error fetching the trip information from VVS');
  }

  const { trips } = vvsResponse.data;

  let tripInfo;
  switch (typeOf(trips)) {
    case 'array':
      [tripInfo] = trips;
      break;
    case 'object':
      tripInfo = trips.trip;
      break;
    default:
      throw new Error('Error retrieving trip information');
  }

  logger.trace(`vvsModule - getNextConnection: trip duration = ${tripInfo.duration}`);
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

  return trip;
};

module.exports = vvsModule;
logger.debug('vvsModule initialized');
