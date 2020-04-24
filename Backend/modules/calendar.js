const ical = require('node-ical');
const preferences = require('./preferences');

async function fetchCalendarEvents() {
  const { calendarURL } = await preferences.getChecked();
  return ical.async.fromURL(calendarURL);
}

async function getEventsStartingBetween({ start, end }) {
  const events = await fetchCalendarEvents();
  const startDate = new Date(start);
  const endDate = new Date(end);

  return Object.values(events)
    .filter((event) => event.type === 'VEVENT'
                       && event.start >= startDate
                       && event.start <= endDate)
    .sort((a, b) => a.start - b.start);
}

async function getFreeSlotsBetween({ start, end }) {
  const events = await fetchCalendarEvents();

  let freeSlots = [{
    start: new Date(start),
    end: new Date(end),
  }];

  Object.values(events).forEach((event) => {
    freeSlots = freeSlots.flatMap(({ start: slotStart, end: slotEnd }) => {
      if (slotStart >= event.end || slotEnd <= event.start) {
        // event does not block slot
        return [{
          start: slotStart,
          end: slotEnd,
        }];
      }

      // event blocks slot
      const subSlots = [];

      if (slotStart < event.start) {
        // slot part before event start
        subSlots.push({
          start: slotStart,
          end: event.start,
        });
      }

      if (slotEnd > event.end) {
        // slot part after event end
        subSlots.push({
          start: event.end,
          end: slotEnd,
        });
      }

      return subSlots;
    });
  });

  return freeSlots;
}

module.exports = {
  getEventsStartingBetween,
  getFreeSlotsBetween,
};
