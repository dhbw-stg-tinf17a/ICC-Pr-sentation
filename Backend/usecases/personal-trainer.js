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

async function getConnectionToPlace({
  latitude, longitude, departure, pref,
}) {
  if (pref.location === undefined) {
    throw new Error('Home location is not set');
  }

  return vvs.getConnection({
    originCoordinates: pref.location,
    destinationCoordinates: { latitude, longitude },
    departure,
  });
}

async function getFreeSlotForActivity(pref) {
  const start = moment.tz(timezone).hour(pref.personalTrainerStart.hour)
    .minute(pref.personalTrainerStart.minute).startOf('minute');
  const end = start.clone().hour(pref.personalTrainerEnd.hour)
    .minute(pref.personalTrainerEnd.minute);

  const freeSlots = await calendar.getFreeSlotsBetween({ start, end });
  if (freeSlots.length === 0) {
    return undefined;
  }

  // find the longest slot and check if it sufficiently long
  const freeSlot = freeSlots.sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
  if (moment.duration(moment(freeSlot.end).diff(freeSlot.start)).asMinutes()
      < pref.personalTrainerRequiredMinutes) {
    return undefined;
  }

  return freeSlot;
}

async function getRandomPOI({ category, pref }) {
  if (pref.location === undefined) {
    throw new Error('Home location is not set');
  }

  const pois = await places.getPOIsAround({
    category,
    limit: 100,
    radius: pref.personalTrainerMaxDistance,
    ...pref.location,
  });

  if (pois.length === 0) {
    return undefined;
  }

  return pois[Math.floor(Math.random() * pois.length)];
}

async function getRandomSportsCenter(pref) {
  return getRandomPOI({
    category: 'SPORTS_CENTER',
    pref,
  });
}


async function getRandomParkRecreationArea(pref) {
  return getRandomPOI({
    category: 'PARK_RECREATION_AREA',
    pref,
  });
}

async function getWeatherForecast(pref) {
  if (pref.location === undefined) {
    throw new Error('Home location is not set');
  }

  const forecast = await weather.getForecast({
    ...pref.location,
    duration: 1,
  });
  return forecast[0];
}

async function run() {
  try {
    const pref = await preferences.get();

    const freeSlot = await getFreeSlotForActivity(pref);
    if (freeSlot === undefined) {
      return;
    }

    const precipitation = (await getWeatherForecast(pref)).day.hasPrecipitation;

    let place;
    if (precipitation) {
      place = await getRandomSportsCenter(pref);
    } else {
      place = await getRandomParkRecreationArea(pref);
    }
    if (place === undefined) {
      return;
    }

    const freeSlotStart = moment(freeSlot.start).tz(timezone).format('HH:mm');
    const notificationTime = moment(freeSlot.start)
      .subtract(pref.personalTrainerMinutesBeforeStart, 'minutes');

    const body = `You have got a little time at ${freeSlotStart}. Since it ${precipitation ? 'rains' : 'does not rain'} today, why don't you do some sports at ${place.poi.name}?`;
    schedule.scheduleJob(notificationTime, async () => {
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
    logger.debug(`Personal trainer usecase: Scheduled notification at ${notificationTime.toISOString()} with body '${body}'`);
  } catch (err) {
    logger.error(err);
  }
}

function init() {
  // every day at 00:00
  const job = schedule.scheduleJob(
    {
      minute: 0,
      hour: 0,
      tz: timezone,
    }, run,
  );
  logger.info(`Personal trainer usecase: First invocation at ${job.nextInvocation().toISOString()}`);
}

module.exports = {
  init,
  getFreeSlotForActivity,
  getWeatherForecast,
  getRandomSportsCenter,
  getRandomParkRecreationArea,
  getConnectionToPlace,
};
