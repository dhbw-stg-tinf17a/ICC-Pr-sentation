const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const ical = require('node-ical');
const moment = require('moment');
const User = require('./user');

const calendarModule = {};

async function getUsersCalendarUrlFromUserPreferences() {
  const preferences = await User.getUserPreferences();

  if (preferences.calendarUrl === undefined) throw new Error("User hasn't set their calendar url yet.");
  return preferences.calendarUrl;
}

async function fetchCalendarEvents() {
  const calendarUrl = await getUsersCalendarUrlFromUserPreferences();
  return ical.async.fromURL(calendarUrl);
}

calendarModule.getTodaysFirstEvent = async () => {
  const events = await fetchCalendarEvents();
  if (!events || events.length === 0) throw new Error('There are no events');

  const eventArray = Object.values(events);
  let firstEventToday;
  let firstEventTomorrow;

  const now = moment();
  const today = now.dayOfYear();
  const tomorrow = today + 1;

  eventArray.forEach((event) => {
    if (event.type !== 'VEVENT') return;
    const eventDate = moment(event.start);
    const dayOfEvent = eventDate.dayOfYear();

    if (dayOfEvent !== today && dayOfEvent !== tomorrow) return;
    if (dayOfEvent === today
          && (firstEventToday === undefined || eventDate.isBefore(firstEventToday.start))) {
      firstEventToday = event;
    }
    if (dayOfEvent === tomorrow
          && (firstEventTomorrow === undefined || eventDate.isBefore(firstEventTomorrow.start))) {
      firstEventTomorrow = event;
    }
  });

  if (firstEventToday && now.isBefore(firstEventToday.start)) return firstEventToday;
  if (firstEventTomorrow && now.isBefore(firstEventTomorrow.start)) return firstEventTomorrow;
  throw new Error('There are no events');
};

module.exports = calendarModule;
logger.debug('calendarModule initialized');
