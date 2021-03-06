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

const schedule = require('node-schedule');
const moment = require('moment-timezone');
const logger = require('../utilities/logger');
const calendar = require('../modules/calendar');
const places = require('../modules/places');
const notifications = require('../modules/notifications');
const preferences = require('../modules/preferences');
const { formatTime } = require('../utilities/formatter');

const timezone = 'Europe/Berlin';

async function getFreeSlotForLunchbreak() {
  const pref = await preferences.getChecked();

  const start = moment
    .tz(timezone)
    .hour(pref.lunchBreakStart.hour)
    .minute(pref.lunchBreakStart.minute)
    .startOf('minute');
  const end = start
    .clone()
    .hour(pref.lunchBreakEnd.hour)
    .minute(pref.lunchBreakEnd.minute);

  const freeSlots = await calendar.getFreeSlotsBetween({
    start,
    end,
  });
  if (freeSlots.length === 0) {
    return undefined;
  }

  // find the longest slot and check if it sufficiently long
  const sortedFreeSlots = freeSlots.sort((a, b) => (b.end - b.start) - (a.end - a.start));
  const freeSlot = sortedFreeSlots[0];
  const freeSlotMinutes = moment.duration(moment(freeSlot.end).diff(freeSlot.start)).asMinutes();
  if (freeSlotMinutes < pref.lunchBreakRequiredMinutes) {
    return undefined;
  }

  return freeSlot;
}

async function getRandomRestaurantNear({ latitude, longitude }) {
  const pref = await preferences.getChecked();

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
    logger.debug(`Lunch break usecase: Running at ${new Date().toISOString()}`);

    const pref = await preferences.getChecked();

    const freeSlot = await getFreeSlotForLunchbreak();
    if (freeSlot === undefined) {
      logger.debug('Lunch break usecase: No free slot found');
      return;
    }

    const notificationTime = moment(freeSlot.start)
      .subtract(pref.lunchBreakMinutesBeforeStart, 'minutes');
    const body = `You have some time to spare during your lunch break at ${formatTime(freeSlot.start)}, why not try a restaurant?`;

    schedule.scheduleJob(new Date(notificationTime), async () => {
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
      logger.debug(`Lunch break usecase: Sent notification with body '${body}'`);
    });

    logger.debug(`Lunch break usecase: Scheduled notification at ${notificationTime.toISOString()} with body '${body}'`);
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
  run,
  getFreeSlotForLunchbreak,
  getRandomRestaurantNear,
};
