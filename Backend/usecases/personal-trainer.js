/**
 * Many people want to do sport in their free time but often miss external motivation. For this use
 * case, the assistant sends a notification to the user between set times (preferences) when there
 * is a free slot in the calendar. When the user clicks on the notification, the personal trainer
 * use case is opened. The user can also open the use case at any other time using the web app.
 * After opening the use case, the assistant presents a sport type to the user depending on the
 * current weather. Dialog: If the user confirms that they want to do the presented activity, the
 * assistant searches for a sports facility (maps) and presents the route to the sports facility
 * (VVS) if required.
 */

const schedule = require('node-schedule');
const pino = require('pino');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const timezone = 'Europe/Berlin';

async function run() {
  try {
    // TODO
  } catch (err) {
    logger.error(err);
  }
}

function init() {
// every day at 00:00
  schedule.scheduleJob({
    minute: 0, hour: 0, tz: timezone,
  }, run);
}

module.exports = { init };
