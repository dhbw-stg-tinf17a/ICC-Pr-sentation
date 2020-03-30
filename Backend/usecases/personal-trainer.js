/**
 * Many people want to do sport in their free time but often miss external motivation. For this use
 * case, the assistant sends a notification to the user between set times (preferences) when there
 * is a free slot in the calendar. When the user clicks on the notification, the personal trainer
 * use case is opened. The user can also open the use case at any other time using the web app.
 * After opening the use case, the assistant presents a place for doing some sport to the user
 * depending on the current weather. Dialog: If the user confirms that they want to do the presented
 * activity, the assistant  presents the route to the place (VVS) .
 */

// TODO store recommended place for day
// TODO use preferences
// TODO look at tomorrow if todays slot is over

const schedule = require('node-schedule');
const moment = require('moment-timezone');
const pino = require('pino');
const calendar = require('../modules/calendar');
const notifications = require('../modules/notifications');
const places = require('../modules/places');
const preferences = require('../modules/preferences');
const weather = require('../modules/weather');
const vvs = require('../modules/vvs');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const timezone = 'Europe/Berlin';
const startHour = 15;
const startMinute = 0;
const endHour = 22;
const endMinute = 0;
const requiredMinutes = 60;
const minutesBeforeStart = 30;
const maxDistance = 1;

async function getConnectionToPlace({ latitude, longitude, departure }) {
  const { location } = await preferences.get();
  if (location === undefined) {
    throw new Error('Home location is not set');
  }

  return vvs.getConnection({
    originCoordinates: location,
    destinationCoordinates: { latitude, longitude },
    departure,
  });
}

async function getFreeSlotForActivity() {
  const start = moment.tz(timezone).hour(startHour).minute(startMinute).startOf('minute');
  const end = start.clone().hour(endHour).minute(endMinute);

  const freeSlots = await calendar.getFreeSlotsBetween({ start, end });
  if (freeSlots.length === 0) {
    return undefined;
  }

  // find the longest slot and check if it sufficiently long
  const freeSlot = freeSlots.sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
  if (moment.duration(moment(freeSlot.end).diff(freeSlot.start)).asMinutes() < requiredMinutes) {
    return undefined;
  }

  return freeSlot;
}

async function getRandomPOI(category) {
  const { location } = await preferences.get();
  if (location === undefined) {
    throw new Error('Home location is not set');
  }

  const pois = await places.getPOIsAround({
    category, limit: 100, radius: maxDistance, ...location,
  });

  if (pois.length === 0) {
    return undefined;
  }

  return pois[Math.floor(Math.random() * pois.length)];
}

async function getRandomSportsCenter() {
  return getRandomPOI('SPORTS_CENTER');
}


async function getRandomParkRecreationArea() {
  return getRandomPOI('PARK_RECREATION_AREA');
}

async function getWeather() {
  const { location } = await preferences.get();
  if (location === undefined) {
    throw new Error('Home location is not set');
  }

  const forecast = await weather.getForecast({ ...location, duration: 1 });
  return forecast[0];
}

async function run() {
  try {
    const freeSlot = await getFreeSlotForActivity();
    if (freeSlot === undefined) {
      return;
    }

    const precipitation = (await getWeather()).day.hasPrecipitation;
    let place;
    if (precipitation) {
      place = await getRandomSportsCenter();
    } else {
      place = await getRandomParkRecreationArea();
    }
    if (place === undefined) {
      return;
    }

    const freeSlotStart = moment(freeSlot.start).tz(timezone).format('HH:mm');
    const notificationTime = moment(freeSlot.start).subtract(minutesBeforeStart, 'minutes');

    const body = `You have got a little time at ${freeSlotStart}. Since it ${precipitation ? 'rains' : 'does not rain'} today, why don't you do some sports at ${place.poi.name}?`;
    const job = schedule.scheduleJob(notificationTime, async () => {
      await notifications.sendNotifications({
        title: 'Recommended sports activity',
        options: {
          body,
          icon: '/favicon.jpg',
          badge: '/badge.png',
          data: {
            usecase: 'personal-trainer',
          },
        },
      });
    });
    if (job !== null) {
      logger.debug(`Personal trainer usecase: Notification at ${job.nextInvocation().toISOString()} with body '${body}'`);
    }
  } catch (err) {
    logger.error(err);
  }
}

function init() {
  // every day at 00:00
  const job = schedule.scheduleJob({
    minute: 0, hour: 0, tz: timezone,
  }, run);
  logger.info(`Personal trainer usecase: First invocation at ${job.nextInvocation().toISOString()}`);
}

module.exports = {
  init,
  getFreeSlotForActivity,
  getWeather,
  getRandomSportsCenter,
  getRandomParkRecreationArea,
  getConnectionToPlace,
};