/* eslint-disable no-await-in-loop */
/**
 * Travel is very popular, but the search for a destination is often complicated. For this use case,
 * the assistant sends a notification every Friday at 07:00, if the user does not have events during
 * the weekend (calendar). When the user clicks on the notification, the travel planning use case is
 * opened. The user can also open the use case at any other time using the web app. After opening
 * the use case, the assistant presents a travel destination which the user has not yet visited
 * (preferences), prices for a roundtrip to the destination (DB) and the weather at the destination
 * (weather). Dialog: If the user confirms that they want to travel to the presented destination,
 * the assistant presents the route taken to the main station (VVS) and will not recommend that
 * destination again.
 */

// TODO remember travel destination for weekend
// TODO use preferences
// TODO store visited destinations

const schedule = require('node-schedule');
const moment = require('moment-timezone');
const geolib = require('geolib');
const pino = require('pino');
const calendar = require('../modules/calendar');
const db = require('../modules/db');
const weather = require('../modules/weather');
const notifications = require('../modules/notifications');
const vvs = require('../modules/vvs');
const preferences = require('../modules/preferences');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const mainStation = { dbID: '8098096', location: { latitude: 48.784084, longitude: 9.181635 }, vvsID: 'de:08111:6115' }; // Stuttgart Hbf
const minDistance = 100; // km
const excludedStationIDs = ['8098096'];
const timezone = 'Europe/Berlin';

async function getWeekend() {
  const today = moment.tz(timezone).startOf('day');
  const saturdayStart = today.clone().day(6);
  const saturdayEnd = saturdayStart.clone().endOf('day');
  const sundayStart = today.clone().day(7);
  const sundayEnd = sundayStart.clone().endOf('day');

  const [
    saturdayEvent,
    sundayEvent,
  ] = await Promise.all([
    calendar.getFirstEventStartingBetween({ start: saturdayStart, end: saturdayEnd }),
    calendar.getFirstEventStartingBetween({ start: sundayStart, end: sundayEnd }),
  ]);

  return {
    saturday: saturdayStart,
    sunday: sundayStart,
    saturdayFree: saturdayEvent === undefined,
    sundayFree: sundayEvent === undefined,
  };
}

async function planTrip({ departure, arrival, destinationID }) {
  const [
    connectionsToDestination,
    connectionsFromDestination,
  ] = await Promise.all([
    db.getConnections({
      originID: mainStation.dbID,
      destinationID,
      departure,
    }),
    db.getConnections({
      originID: destinationID,
      destinationID: mainStation.dbID,
      departure: arrival,
    }),
  ]);

  const connectionToDestination = connectionsToDestination.sort((a, b) => a.price - b.price)
    .find(() => true);
  const connectionFromDestination = connectionsFromDestination.sort((a, b) => a.price - b.price)
    .find(() => true);

  return { connectionToDestination, connectionFromDestination };
}

async function planRandomTrip({ departure, arrival }) {
  const stations = await db.getFilteredStations((station) => station.location
    && geolib.getDistance(mainStation.location, station.location) / 1000 >= minDistance // m to km
    && !excludedStationIDs.findIndex((stationID) => station.id === stationID) >= 0);

  let connectionToDestination;
  let connectionFromDestination;
  let destination;
  do {
    destination = stations[Math.floor(Math.random() * stations.length)];

    ({
      connectionToDestination, connectionFromDestination,
    } = await planTrip({ departure, arrival, destinationID: destination.id }));
  } while (!connectionToDestination || !connectionFromDestination);

  return { destination, connectionToDestination, connectionFromDestination };
}

async function getWeather({ destination, saturday, sunday }) {
  const now = moment().startOf('day');
  const daysToSaturday = moment(saturday).endOf('day').diff(now, 'days');
  const daysToSunday = moment(sunday).endOf('day').diff(now, 'days');

  const forecast = await weather.getForecast({
    latitude: destination.location.latitude,
    longitude: destination.location.longitude,
    duration: 10,
  });

  return { saturdayWeather: forecast[daysToSaturday], sundayWeather: forecast[daysToSunday] };
}

async function getConnectionToMainStation(arrival) {
  const { location } = await preferences.get();
  if (location === undefined) {
    throw new Error('Home location is not set');
  }

  // TODO use station id instead of coordinates
  return vvs.getConnection({
    originCoordinates: location,
    destinationStop: mainStation.vvsID,
    arrival,
  });
}

async function run() {
  try {
    const {
      saturday, sunday, saturdayFree, sundayFree,
    } = await getWeekend();
    if (!saturdayFree || !sundayFree) {
      return;
    }

    const trip = await planRandomTrip({ departure: saturday, arrival: sunday });
    const { destination, connectionToDestination, connectionFromDestination } = trip;
    const price = connectionToDestination.price + connectionFromDestination.price;

    const body = `Your weekend seems to be free, why not travel to ${destination.address.city} and back for just ${price} €?`;
    const job = notifications.sendNotifications({
      title: 'Recommended trip for this weekend',
      options: {
        body,
        icon: '/favicon.jpg',
        badge: '/badge.png',
        data: {
          usecase: 'travel-planning',
          destinationID: destination.id,
        },
      },
    });
    if (job !== null) {
      logger.debug(`Travel planning usecase: Notification at ${job.nextInvocation().toISOString()} with body '${body}'`);
    }
  } catch (error) {
    logger.error(error);
  }
}

function init() {
  // every Friday at 07:00
  const job = schedule.scheduleJob({
    minute: 0, hour: 7, dayOfWeek: 5, tz: timezone,
  }, run);
  logger.info(`Travel planning usecase: First invocation at ${job.nextInvocation().toISOString()}`);
}

module.exports = {
  init, getWeekend, planTrip, planRandomTrip, getWeather, getConnectionToMainStation,
};
