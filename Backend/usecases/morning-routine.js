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
const quote = require('../modules/quote');
const vvs = require('../modules/vvs');
const weather = require('../modules/weather');
const user = require('../modules/user');
const notifications = require('../modules/notifications');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

async function getWakeUpTimeForNextFirstEventOfDay() {
  const [
    event,
    preparationTime,
  ] = await Promise.all([
    calendar.getNextFirstEventOfDay(),
    user.getUsersPreparationTime(),
  ]);

  let departure;
  if (event.location) {
    departure = await vvs.getLastConnectionStartTime(event.start, event.location);
  } else {
    departure = event.start;
  }

  const wakeUpTime = moment(departure).subtract(preparationTime, 'minutes');

  return {
    event, departure, wakeUpTime, preparationTime,
  };
}

async function getWeatherForecastAtHome() {
  const { lat, lon } = await user.getUserCoordinates();
  return weather.getForecast({ latitude: lat, longitude: lon, duration: 1 });
}

async function run() {
  try {
    const { event, departure, wakeUpTime } = await getWakeUpTimeForNextFirstEventOfDay();

    schedule.scheduleJob(wakeUpTime, () => {
      notifications.sendNotifications({
        title: 'Wake up!',
        options: {
          body: `${event.summary} starts at ${moment(event.start).format('HH:mm')}. You have to leave at ${moment(departure).format('HH:mm')}.`,
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
  // every day at 00:00
  schedule.scheduleJob({ minute: 0, hour: 0, dayOfWeek: [1, 2, 3, 4, 5] }, run);
}

module.exports = { init, run };
