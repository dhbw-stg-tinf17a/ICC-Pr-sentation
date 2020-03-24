/* eslint-disable no-await-in-loop */
/**
 * Travel is very popular, but the search for a destination is often complicated. For this use case,
 * the assistant sends a notification before the weekend, if the user has enough free time during
 * the weekend (calendar). When the user clicks on the notification, the travel planning use case is
 * opened. The user can also open the use case at any other time using the web app. After opening
 * the use case, the assistant presents an optimal travel destination depending on preferred
 * countries of the user (preferences) and prices for a roundtrip to the destination, starting from
 * the main station (DB). The assistant also presents the weather during the weekend at the
 * destination. Dialog: If the user confirms that they want to travel to the presented destination,
 * the assistant presents the route taken to the main station (VVS) and from there to the
 * destination (DB). Extension 1: If the user wants to travel to a different destination, the
 * assistant presents an alternative travel destination. Extension 2: The travel destination depends
 * on the weather at possible destinations and the weather preferred by the user (preferences).
 */

const schedule = require('node-schedule');
const moment = require('moment');
const geolib = require('geolib');
const pino = require('pino');
const calendar = require('../modules/calendar');
const db = require('../modules/db');
const notifications = require('../modules/notifications');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// TODO from user preferences
const home = { id: '8098096', latitude: 48.784084, longitude: 9.181635 }; // Stuttgart Hbf
const minDistance = 100; // km
const excluded = [
  { id: '8098096', latitude: 48.784084, longitude: 9.181635 },
];

async function isWeekendFree() {
  const today = moment().startOf('day');
  const saturday = moment(today).day(today.day() === 6 ? 13 : 6);
  const sunday = moment(today).day(today.day() === 6 ? 14 : 7);

  const saturdayFree = undefined === await calendar.getFirstEventOfDay(saturday);
  const sundayFree = undefined === await calendar.getFirstEventOfDay(sunday);

  return {
    saturday, sunday, saturdayFree, sundayFree,
  };
}

async function planTrip({ departure, arrival, destinationID }) {
  const [
    connectionsToDestination,
    connectionsFromDestination,
  ] = await Promise.all([
    db.getConnections({
      startID: home.id,
      destinationID,
      datetime: departure,
    }),
    db.getConnections({
      startID: destinationID,
      destinationID: home.id,
      datetime: arrival,
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

async function planRandomTripIfWeekendIsFree() {
  try {
    const {
      saturday, sunday, saturdayFree, sundayFree,
    } = await isWeekendFree();
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
  // every Friday
  schedule.scheduleJob({ dayOfWeek: 5 }, planRandomTripIfWeekendIsFree);
}

module.exports = {
  isWeekendFree, planTrip, planRandomTrip, planRandomTripIfWeekendIsFree, init,
};
