/**
 * Many people want to explore different alternatives during their lunch breaks, but the search for
 * restaurants is a time-consuming task. For this use case, the assistant sends a notification
 * shortly before the lunch break. This depends on the calendar and on the preferred lunch break
 * times (preferences). When the user clicks on the notification, the lunch break use case is
 * opened. The user can also open the use case at any other time using the web app. After opening
 * the use case, the assistant presents a restaurant to go to during the lunch break (maps).
 * Dialog: If the user wants to go to that restaurant during the lunch break, the assistant presents
 * the route taken to the destination (VVS). Extension 1: If the user wants to go to a different
 * restaurant, the assistant presents an alternative restaurant. Extension 2: The user can rate
 * different restaurants, to which the assistant applies learning techniques for selecting new
 * restaurants.
 */

const schedule = require('node-schedule');
const pino = require('pino');
const moment = require('moment-timezone');
const calendar = require('../modules/calendar');
const preferences = require('../modules/preferences');
const places = require('../modules/places');
const notifications = require('../modules/notifications');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// TODO from preferences
const startHour = 11;
const endHour = 14;
const minHours = 1;
const radius = 1;

async function run() {
  try {
    const startDatetime = new Date();
    startDatetime.setHours(startHour, 0, 0, 0);
    const endDatetime = new Date(startDatetime.getTime());
    endDatetime.setHours(endHour, 0, 0, 0);

    const [
      freeSlots,
      { location },
    ] = await Promise.all([
      calendar.getFreeSlots({ startDatetime, endDatetime }),
      preferences.get(),
    ]);
    if (freeSlots.length === 0) {
      return;
    }

    // find the longest slot and check if it sufficiently long
    const freeSlot = freeSlots.sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
    if (moment.duration(moment(freeSlot.end).diff(freeSlot.start)).asHours() < minHours) {
      return;
    }

    const restaurants = await places.getPOIsAround({
      ...location, category: 'restaurant', limit: 100, radius,
    });
    if (restaurants.length === 0) {
      return;
    }

    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];

    // TODO schedule notification before lunch break
    notifications.sendNotifications({
      title: 'Recommended restaurant for your lunch break',
      options: {
        body: `You have some time to spare during your lunch break, why not go to ${restaurant.poi.name}?`,
        icon: '/favicon.jpg',
        badge: '/badge.png',
        data: {
          usecase: 'lunch-break',
          restaurant: {
            name: restaurant.poi.name,
            categories: restaurant.poi.categories,
            address: restaurant.address.freeformAddress,
            latitude: restaurant.position.lat,
            longitude: restaurant.position.lon,
          },
        },
      },
    });
  } catch (error) {
    logger.error(error);
  }
}

function init() {
  // every day at 00:00, but not on the weekend
  schedule.scheduleJob({ minute: 0, hour: 0, dayOfWeek: [1, 2, 3, 4, 5] }, run);
}

module.exports = {
  init, run,
};
