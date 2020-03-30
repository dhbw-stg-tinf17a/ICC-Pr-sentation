/**
 * Many people want to explore different alternatives during their lunch breaks, but the search for
 * restaurants is a time-consuming task. For this use case, the assistant sends a notification
 * shortly before the lunch break. This depends on the calendar and on the preferred lunch break
 * time (preferences). When the user clicks on the notification, the lunch break use case is
 * opened. The user can also open the use case at any other time using the web app. After opening
 * the use case, the assistant presents a restaurant to go to during the lunch break (maps).
 * Dialog: If the user wants to go to that restaurant during the lunch break, the assistant presents
 * the route taken to the destination (VVS).
 */

// TODO store recommended restaurant for day
// TODO look at tomorrow if todays slot is over
// TODO store visited restaurants

const schedule = require('node-schedule');
const pino = require('pino');
const moment = require('moment-timezone');
const calendar = require('../modules/calendar');
const places = require('../modules/places');
const notifications = require('../modules/notifications');
const preferences = require('../modules/preferences');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const timezone = 'Europe/Berlin';

async function getFreeSlotForLunchbreak(pref) {
  const start = moment.tz(timezone).hour(pref.lunchBreakStart.hour)
    .minute(pref.lunchBreakStart.minute).startOf('minute');
  const end = start.clone().hour(pref.lunchBreakEnd.hour).minute(pref.lunchBreakEnd.minute);

  const freeSlots = await calendar.getFreeSlotsBetween({
    start,
    end,
  });
  if (freeSlots.length === 0) {
    return undefined;
  }

  // find the longest slot and check if it sufficiently long
  const freeSlot = freeSlots.sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
  if (moment.duration(moment(freeSlot.end).diff(freeSlot.start)).asMinutes()
      < pref.lunchBreakRequiredMinutes) {
    return undefined;
  }

  return freeSlot;
}

async function getRandomRestaurantNear({ latitude, longitude, pref }) {
  const restaurants = await places.getPOIsAround({
    latitude,
    longitude,
    category: 'RESTAURANT',
    limit: 100,
    radius: pref.lunchBreakMaxDistance,
  });
  if (restaurants.length === 0) {
    return undefined;
  }

  return restaurants[Math.floor(Math.random() * restaurants.length)];
}

async function run() {
  try {
    const pref = await preferences.get();

    const freeSlot = await getFreeSlotForLunchbreak(pref);
    if (freeSlot === undefined) {
      return;
    }

    const freeSlotStart = moment(freeSlot.start).tz(timezone).format('HH:mm');
    const notificationTime = moment(freeSlot.start)
      .subtract(pref.lunchBreakMinutesBeforeStart, 'minutes');

    const body = `You have some time to spare during your lunch break at ${freeSlotStart}, why not try a restaurant?`;
    const job = schedule.scheduleJob(notificationTime, async () => {
      await notifications.sendNotifications({
        title: 'Recommended restaurant for your lunch break',
        options: {
          body,
          icon: '/favicon.jpg',
          badge: '/badge.png',
          data: {
            usecase: 'lunch-break',
          },
        },
      });
    });
    if (job !== null) {
      logger.debug(`Lunch break usecase: Notification at ${job.nextInvocation().toISOString()} with body '${body}'`);
    }
  } catch (error) {
    logger.error(error);
  }
}

function init() {
  // every day at 00:00, but not on the weekend
  const job = schedule.scheduleJob(
    {
      minute: 0,
      hour: 0,
      dayOfWeek: [1, 2, 3, 4, 5],
      tz: timezone,
    },
    run,
  );
  logger.info(`Lunch break usecase: First invocation at ${job.nextInvocation().toISOString()}`);
}

module.exports = {
  init,
  getFreeSlotForLunchbreak,
  getRandomRestaurantNear,
};
