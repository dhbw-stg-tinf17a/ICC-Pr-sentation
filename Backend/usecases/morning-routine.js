/**
 * In the morning, most people always repeat the same set of tasks. For this use case, the assistant
 * sends a notification to the user depending on the start of the first event in the calendar, the
 * travel time to the first event (VVS), and the time they need to get ready (preferences) (time of
 * notification = start of the first event - travel time - time to get ready). When the user clicks
 * on the notification, the morning routine use case is opened in the web app. The user can also
 * open the use case at any other time using the web app. After opening the use case, the assistant
 * presents the route to the first event in the calendar (VVS) and the weather forecast for the day.
 * Dialog: If the user confirms that they want to hear the daily quote, a daily quote is also
 * presented to the user.
 */

const schedule = require('node-schedule');
const moment = require('moment-timezone');
const pino = require('pino');
const calendar = require('../modules/calendar');
const vvs = require('../modules/vvs');
const weather = require('../modules/weather');
const preferences = require('../modules/preferences');
const notifications = require('../modules/notifications');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// TODO from prefereneces
const preparationTime = 45;

async function getWakeUpTimeForNextFirstEventOfDay() {
  const [
    event,
    { location },
  ] = await Promise.all([
    calendar.getNextFirstEventOfDay(),
    preferences.get(),
  ]);

  const connection = await vvs.getConnection({
    originCoordinates: location, destinationAddress: event.location, arrival: event.start,
  });

  const wakeUpTime = moment(connection.departure).subtract(preparationTime || 0, 'minutes');

  return {
    event, connection, wakeUpTime,
  };
}

async function getWeatherForecastAtHome() {
  const { location } = await preferences.get();
  return weather.getForecast({ ...location, duration: 1 });
}

async function run() {
  try {
    const { event, connection, wakeUpTime } = await getWakeUpTimeForNextFirstEventOfDay();

    const eventStart = moment(event.start).tz('Europe/Berlin').format('HH:mm');
    const departure = moment(connection.departure).tz('Europe/Berlin').format('HH:mm');

    schedule.scheduleJob(wakeUpTime, async () => {
      await notifications.sendNotifications({
        title: 'Wake up!',
        options: {
          body: `${event.summary} starts at ${eventStart}. You have to leave at ${departure}.`,
          icon: '/favicon.jpg',
          badge: '/badge.png',
          data: {
            usecase: 'morning-routine',
          },
        },
      });
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
  getWakeUpTimeForNextFirstEventOfDay, getWeatherForecastAtHome, run, init,
};
