/**
 * In the morning, most people always repeat the same set of tasks. For this use case, the assistant
 * sends a notification to the user depending on the start of the first event in the calendar, the
 * travel time to the first event (VVS), and the time they need to get ready (preferences) (time of
 * notification = start of the first event - travel time - time to get ready). The notification is
 * not sent during the weekend. When the user clicks on the notification, the morning routine use
 * case is opened in the web app. The user can also open the use case at any other time using the
 * web app. After opening the use case, the assistant presents the route to the first event in the
 * calendar (VVS) and the weather forecast for the day. Dialog: If the user confirms that they want
 * to hear the daily quote, a daily quote is also presented to the user.
 */

// TODO look at tomorrow if there is no event today or the first event today already started?

const schedule = require('node-schedule');
const moment = require('moment-timezone');
const pino = require('pino');
const calendar = require('../modules/calendar');
const vvs = require('../modules/vvs');
const weather = require('../modules/weather');
const preferences = require('../modules/preferences');
const notifications = require('../modules/notifications');
const quote = require('../modules/quote');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const timezone = 'Europe/Berlin';

async function getQuoteOfTheDay(pref) {
  return quote.getQuoteOfTheDay(pref.mornginRoutineQuoteCategory);
}

async function getWakeUpTimeForFirstEventOfToday(pref) {
  const start = moment.tz(timezone).startOf('day');
  const end = start.clone().endOf('day');

  const event = await calendar.getFirstEventStartingBetween({ start, end });
  if (event === undefined) {
    // no event today
    return {};
  }

  if (!event.location) {
    // event has no location set
    const wakeUpTime = moment(event.start).subtract(pref.morningRoutineMinutesForPreparation, 'minutes');
    return { event, wakeUpTime };
  }

  if (pref.location === undefined) {
    throw new Error('Home location is not set');
  }

  const connection = await vvs.getConnection({
    originCoordinates: pref.location, destinationAddress: event.location, arrival: event.start,
  });
  if (connection === undefined) {
    // no connection found
    const wakeUpTime = moment(event.start).subtract(pref.morningRoutineMinutesForPreparation, 'minutes');
    return { event, wakeUpTime };
  }

  const wakeUpTime = moment(connection.departure).subtract(pref.morningRoutineMinutesForPreparation, 'minutes');

  return {
    event, connection, wakeUpTime,
  };
}

async function getWeatherForecast(pref) {
  return weather.getForecast({ ...pref.location, duration: 1 })[0];
}

async function run() {
  try {
    const pref = await preferences.get();

    const { event, connection, wakeUpTime } = await getWakeUpTimeForFirstEventOfToday(pref);

    const eventStart = moment(event.start).tz(timezone).format('HH:mm');
    const departure = moment(connection.departure).tz(timezone).format('HH:mm');

    const body = `${event.summary} starts at ${eventStart}. You have to leave at ${departure}.`;
    const job = schedule.scheduleJob(wakeUpTime, async () => {
      await notifications.sendNotifications({
        title: 'Wake up!',
        options: {
          body,
          icon: '/favicon.jpg',
          badge: '/badge.png',
          data: {
            usecase: 'morning-routine',
          },
        },
      });
    });
    if (job !== null) {
      logger.debug(`Morning routine usecase: Notification at ${job.nextInvocation().toISOString()} with body '${body}'`);
    }
  } catch (error) {
    logger.error(error);
  }
}

function init() {
  // every day at 00:00, but not on the weekend
  const job = schedule.scheduleJob({
    minute: 0, hour: 0, dayOfWeek: [1, 2, 3, 4, 5], tz: timezone,
  }, run);
  logger.info(`Morning routine usecase: First invocation at ${job.nextInvocation().toISOString()}`);
}

module.exports = {
  init, getWakeUpTimeForFirstEventOfToday, getWeatherForecast, getQuoteOfTheDay,
};
