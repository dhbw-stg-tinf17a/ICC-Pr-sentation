
const moment = require('moment-timezone');

const timezone = 'Europe/Berlin';

function formatDate(date) {
  const newDate = new Date(date);
  return newDate.toLocaleTimeString('en-us', {
    timeZone: 'Europe/Berlin',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(date) {
  return moment.tz(date, timezone).format('HH:mm');
}

module.exports = { formatDate, formatTime };
