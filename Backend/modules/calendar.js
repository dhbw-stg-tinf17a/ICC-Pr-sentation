const calendarModule = {};

const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const ical = require('node-ical');
const moment = require('moment');
const User = require('./user');

calendarModule.getTodaysFirstEvent = function () {
  return new Promise((resolve, reject) => {
    fetchCalendarEvents()
      .then((events) => {
        if (!events || events.length == 0) return reject({ message: "User hasn't set any events yet" });

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
          if (dayOfEvent === today && (firstEventToday === undefined || eventDate.isBefore(firstEventToday.start))) firstEventToday = event;
          if (dayOfEvent === tomorrow && (firstEventTomorrow === undefined || eventDate.isBefore(firstEventTomorrow.start))) firstEventTomorrow = event;
          // logger.trace(`${event.summary} is in ${event.location} on the ${event.start.getDate()}. of ${months[event.start.getMonth()]} at ${event.start.toLocaleTimeString('de-DE')}`);
        });

        if (firstEventToday !== undefined && now.isBefore(firstEventToday.start)) return resolve(firstEventToday);
        if (firstEventTomorrow !== undefined && now.isBefore(firstEventTomorrow.start)) return resolve(firstEventToday);
        reject({ message: 'There are no events today' });
      });
  });
};


function fetchCalendarEvents() {
  return new Promise((resolve, reject) => {
    getUsersCalendarUrlFromUserPreferences()
      .then((url) => ical.async.fromURL(url))
      .then((events) => resolve(events))
      .catch((error) => reject(error));
  });
}

function getUsersCalendarUrlFromUserPreferences() {
  return new Promise((resolve, reject) => {
    User.getUserPreferences()
      .then((preferences) => {
        if (preferences.calendarUrl === undefined) return reject({ message: "User hasn't set their calendar url yet." });
        resolve(preferences.calendarUrl);
      })
      .catch((error) => reject(error));
  });
}


module.exports = calendarModule;
logger.debug('calendarModule initialized');
