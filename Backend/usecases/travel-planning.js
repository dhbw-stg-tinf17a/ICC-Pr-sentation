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
// TODO store visited destinations

const schedule = require('node-schedule');
const moment = require('moment-timezone');
const geolib = require('geolib');
const logger = require('../utilities/logger');
const calendar = require('../modules/calendar');
const db = require('../modules/db');
const weather = require('../modules/weather');
const notifications = require('../modules/notifications');
const vvs = require('../modules/vvs');
const preferences = require('../modules/preferences');

// Stuttgart Hbf
const mainStation = {
  location: {
    latitude: 48.784084,
    longitude: 9.181635,
  },
  dbID: '8098096',
  vvsID: 'de:08111:6115',
};
const excludedStationIDs = ['8098096'];
const timezone = 'Europe/Berlin';

async function getWeekend() {
  const today = moment.tz(timezone).startOf('day');
  const saturdayStart = today.clone().day(6);
  const sundayStart = today.clone().day(7);
  const sundayEnd = sundayStart.clone().endOf('day');

  const events = await calendar.getEventsStartingBetween({
    start: saturdayStart,
    end: sundayEnd,
  });

  return {
    saturday: saturdayStart,
    sunday: sundayStart,
    weekendFree: events.length === 0,
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

  const connectionToDestination = connectionsToDestination
    .sort((a, b) => a.price - b.price)
    .find(() => true);

  const connectionFromDestination = connectionsFromDestination
    .sort((a, b) => a.price - b.price)
    .find(() => true);

  return {
    connectionToDestination,
    connectionFromDestination,
  };
}

async function planRandomTrip({ departure, arrival }) {
  const pref = await preferences.getChecked();

  const stations = await db.getFilteredStations((station) => station.location
    && geolib.getDistance(mainStation.location, station.location) / 1000 // m to km
       >= pref.travelPlanningMinDistance
    && !excludedStationIDs.findIndex((stationID) => station.id === stationID)
       >= 0);

  let connectionToDestination;
  let connectionFromDestination;
  let destination;

  do {
    destination = stations[Math.floor(Math.random() * stations.length)];

    ({
      connectionToDestination,
      connectionFromDestination,
    } = await planTrip({
      departure,
      arrival,
      destinationID: destination.id,
    }));
  } while (!connectionToDestination || !connectionFromDestination);

  return {
    destination,
    connectionToDestination,
    connectionFromDestination,
  };
}

async function getWeatherForecast({ destination, saturday, sunday }) {
  const now = moment.tz(timezone).startOf('day');
  const daysToSaturday = moment.tz(saturday, timezone).endOf('day').diff(now, 'days');
  const daysToSunday = moment.tz(sunday, saturday).endOf('day').diff(now, 'days');

  const forecast = await weather.getForecast({
    latitude: destination.location.latitude,
    longitude: destination.location.longitude,
    duration: 10,
  });

  return {
    saturdayWeatherForecast: forecast[daysToSaturday],
    sundayWeatherForecast: forecast[daysToSunday],
  };
}

async function getConnectionToMainStation({ arrival }) {
  const pref = await preferences.getChecked();

  return vvs.getConnection({
    originCoordinates: pref.location,
    destinationStop: mainStation.vvsID,
    arrival: moment(arrival).subtract(5, 'minutes'),
  });
}

async function run() {
  try {
    logger.debug(`Travel planning usecase: Running at ${new Date().toISOString()}`);

    const {
      saturday,
      sunday,
      weekendFree,
    } = await getWeekend();
    if (!weekendFree) {
      logger.debug('Travel planning usecase: Weekend not free');
      return;
    }

    const {
      destination,
      connectionToDestination,
      connectionFromDestination,
    } = await planRandomTrip({
      departure: saturday,
      arrival: sunday,
    });
    const price = connectionToDestination.price + connectionFromDestination.price;

    const body = `Your weekend seems to be free, why not travel to ${destination.address.city} and back for just ${price} €?`;

    notifications.sendNotifications({
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

    logger.debug(`Travel planning usecase: Sent notification with body '${body}'`);
  } catch (error) {
    logger.error(error);
  }
}

function init() {
  // every Friday at 07:00
  const job = schedule.scheduleJob(
    {
      minute: 0, hour: 7, dayOfWeek: 5, tz: timezone,
    },
    run,
  );

  logger.info(`Travel planning usecase: First invocation at ${job.nextInvocation().toISOString()}`);
}

module.exports = {
  init,
  getWeekend,
  planTrip,
  planRandomTrip,
  getWeatherForecast,
  getConnectionToMainStation,
  run,
};
