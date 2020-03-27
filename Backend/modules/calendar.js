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
  const day = moment(date);

  return Object.values(events)
    .filter((event) => event.type === 'VEVENT' && day.isSame(event.start, 'day'))
    .sort((a, b) => a.start - b.start)
    .find(() => true);
}

async function getNextFirstEventOfDay() {
  const day = new Date();
  const firstEventOfToday = await getFirstEventOfDay(day);
  if (firstEventOfToday && firstEventOfToday.start >= day) {
    return firstEventOfToday;
  }

  day.setUTCDate(day.getUTCDate() + 1);
  const firstEventOfTomorrow = await getFirstEventOfDay(day);
  return firstEventOfTomorrow;
}

async function getFreeSlots({ startDatetime, endDatetime }) {
  return [];
}

module.exports = { getFirstEventOfDay, getNextFirstEventOfDay, getFreeSlots };
