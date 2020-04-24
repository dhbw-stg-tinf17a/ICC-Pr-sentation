
const moment = require('moment-timezone');

const timezone = 'Europe/Berlin';

function formatDatetime(datetime) {
  return moment.tz(datetime, timezone).format('dddd HH:mm');
}

function formatTime(datetime) {
  return moment.tz(datetime, timezone).format('HH:mm');
}

module.exports = {
  formatDatetime,
  formatTime,
};
