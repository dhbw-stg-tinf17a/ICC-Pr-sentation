
const moment = require('moment-timezone');

const timezone = 'Europe/Berlin';

function formatDatetime(datetime) {
  return moment.tz(datetime, timezone).format('dddd hh:mm A');
}

function formatTime(datetime) {
  return moment.tz(datetime, timezone).format('hh:mm A');
}

function formatConnection(connection) {
  return connection.legs.map((leg) => leg.to).join(', then ');
}

module.exports = {
  formatDatetime,
  formatTime,
  formatConnection,
};
