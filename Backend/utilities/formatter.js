
const moment = require('moment-timezone');

const timezone = 'Europe/Berlin';

function formatDatetime(datetime) {
  const localDatetime = moment.tz(datetime, timezone);
  const today = moment.tz(timezone);
  const tomorrow = today.clone().add(1, 'day');

  if (localDatetime.isSame(today, 'day')) {
    return `Today ${localDatetime.format('hh:mm A')}`;
  }

  if (localDatetime.isSame(tomorrow, 'day')) {
    return `Tomorrow ${localDatetime.format('hh:mm A')}`;
  }

  return localDatetime.format('dddd hh:mm A');
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
