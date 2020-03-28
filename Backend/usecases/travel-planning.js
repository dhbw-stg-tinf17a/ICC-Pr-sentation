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
// TODO weather

const schedule = require('node-schedule');
const moment = require('moment-timezone');
const geolib = require('geolib');
const pino = require('pino');
const calendar = require('../modules/calendar');
const db = require('../modules/db');
const notifications = require('../modules/notifications');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const home = { id: '8098096', latitude: 48.784084, longitude: 9.181635 }; // Stuttgart Hbf
const minDistance = 100; // km
const excluded = [
  { id: '8098096', latitude: 48.784084, longitude: 9.181635 },
];
const timezone = 'Europe/Berlin';

async function getWeekend() {
  const today = moment.tz(timezone).startOf('day');
  const saturdayStart = today.clone().day(today.day() === 6 ? 13 : 6);
  const saturdayEnd = saturdayStart.clone().endOf('day');
  const sundayStart = today.clone().day(today.day() === 6 ? 14 : 7);
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
      originID: home.id,
      destinationID,
      departure,
    }),
    db.getConnections({
      originID: destinationID,
      destinationID: home.id,
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
    && geolib.getDistance(home, station.location) / 1000 >= minDistance // convert m to km
    && !excluded.findIndex((otherStation) => station.id === otherStation.id) >= 0);

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

    notifications.sendNotifications({
      title: 'Recommended trip for this weekend',
      options: {
        body: `Your weekend seems to be free, why not travel to ${destination.address.city} and back for just ${price} €?`,
        icon: '/favicon.jpg',
        badge: '/badge.png',
        data: {
          usecase: 'travel-planning',
          destinationID: destination.id,
        },
      },
    });
  } catch (error) {
    logger.error(error);
  }
}

function init() {
  // every Friday at 07:00
  schedule.scheduleJob({
    minute: 0, hour: 7, dayOfWeek: 5, tz: timezone,
  }, run);
}

module.exports = {
  init,
};
