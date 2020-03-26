const ical = require('node-ical');
const moment = require('moment-timezone');
const preferences = require('./preferences');

async function getCalendarURL() {
  const { calendarURL } = await preferences.get();
  if (!calendarURL) {
    throw new Error('Calendar URL is not set');
  }

  return calendarURL;
}

async function fetchCalendarEvents() {
  return ical.async.fromURL(await getCalendarURL());
}

async function getFirstEventOfDay(date) {
  const events = await fetchCalendarEvents();
  const day = moment(date).utc().format('YYYY-MM-DD');

  return Object.values(events)
    .filter((event) => event.type === 'VEVENT' && moment(event.start).utc().format('YYYY-MM-DD') === day)
    .sort((a, b) => a.start - b.start)
    .find(() => true);
}

async function getNextFirstEventOfDay() {
  const today = moment();
  const firstEventOfToday = await getFirstEventOfDay(today);
  if (firstEventOfToday && firstEventOfToday.start >= today) {
    return firstEventOfToday;
  }

  const tomorrow = today.add(1, 'day');
  const firstEventOfTomorrow = await getFirstEventOfDay(tomorrow);
  return firstEventOfTomorrow;
}

module.exports = { fetchCalendarEvents, getFirstEventOfDay, getNextFirstEventOfDay };
