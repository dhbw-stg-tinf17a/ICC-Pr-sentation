const pino = require('pino');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const request = require('axios');
const moment = require('moment-timezone');
const user = require('./user');
const reverseGeocoder = require('./reverseGeocoder');

const typeOf = (object) => Object.prototype.toString.call(object).slice(8, -1).toLowerCase();

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
  const preferences = await user.getUserPreferences();

  if (preferences.currentLocationCoordinates
    && preferences.currentLocationCoordinates.lat
    && preferences.currentLocationCoordinates.lon) {
    return reverseGeocoder.getStreetFromCoordinates(preferences.currentLocationCoordinates);
  }

  throw new Error('Could not load current address from preferences');
}

async function getLastConnectionStartTime(eventStartTime, eventLocation) {
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
}

module.exports = { getLastConnectionStartTime };
