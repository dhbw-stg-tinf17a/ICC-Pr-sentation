const ical = require('node-ical');
const moment = require('moment-timezone');
const preferences = require('./preferences');

async function getCalendarURL() {
  const { calendarURL } = await preferences.get();
  if (calendarURL === undefined) {
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
  if (firstEventOfToday !== undefined && firstEventOfToday.start >= day) {
    return firstEventOfToday;
  }

  day.setUTCDate(day.getUTCDate() + 1);
  const firstEventOfTomorrow = await getFirstEventOfDay(day);
  return firstEventOfTomorrow;
}

async function getFreeSlots({ start, end }) {
  const events = await fetchCalendarEvents();

  let freeSlots = [{ start: new Date(start), end: new Date(end) }];

  Object.values(events).forEach((event) => {
    freeSlots = freeSlots.flatMap(({ start: slotStart, end: slotEnd }) => {
      if (slotStart >= event.end || slotEnd <= event.start) {
        // slot and event do not intersect
        return [{ start: slotStart, end: slotEnd }];
      }

      const subSlots = [];
      if (slotStart < event.start) {
        subSlots.push({ start: slotStart, end: event.start });
      }
      if (slotEnd > event.end) {
        subSlots.push({ start: event.end, end: slotEnd });
      }
      return subSlots;
    });
  });

  return freeSlots;
}

module.exports = { getFirstEventOfDay, getNextFirstEventOfDay, getFreeSlots };
