const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const schedule = require('node-schedule');
const moment = require('moment');
const calendar = require('./calendar');
const User = require('./user');
const vvs = require('./vvs');
const notifications = require('./notifications');

const alarmModule = {};
const dailyCommuteJobName = 'CommuteWakeUpAlarm';

alarmModule.getFirstEventWithTimeToLeave = async () => {
  logger.trace('alarm.js - getFirstEventWithTimeToLeave - start');

  const event = await calendar.getNextFirstEventOfDay();
  logger.trace(`alarm.js - getFirstEventWithTimeToLeave: Event starts at: ${moment(event.start).format('DD.MM HH:mm')}`);

  if (event.location) {
    logger.trace('alarm.js - getFirstEventWithTimeToLeave: Event has a location - fetching last connection');
    event.timeToLeave = await vvs.getLastConnectionStartTime(event.start, event.location);
  } else {
    logger.trace('alarm.js - getFirstEventWithTimeToLeave: Event has no set location.');
    event.timeToLeave = moment(event.start);
  }

  return event;
};

async function wakeUpUser(event) {
  await notifications.sendNotifications({
    title: 'Wake up!',
    options: {
      body: `There is an event you want to attend: ${event.title}`,
      icon: '/favicon.jpg',
      badge: '/badge.png',
    },
  });
}

function setCommuteAlarm() {
  logger.trace('alarm.js - setCommuteAlarm - start');
  Promise.all([User.getUsersPreparationTime(), alarmModule.getFirstEventWithTimeToLeave()])
    .then((promiseValues) => {
      const preparationTimeInMinutes = promiseValues[0];
      const event = promiseValues[1];

      const wakeTime = moment(event.timeToLeave).subtract(preparationTimeInMinutes, 'minutes').toDate();

      if (alarmModule.dailyCommuteJob === undefined) {
        alarmModule.dailyCommuteJob = schedule.scheduleJob(dailyCommuteJobName, wakeTime,
          wakeUpUser);
      } else {
        alarmModule.dailyCommuteJob.reschedule(dailyCommuteJobName, wakeTime, wakeUpUser);
      }
      logger.info(`Setting alarm for event: ${event.summary} at ${wakeTime.toLocaleTimeString('de-DE')}`);
    })
    .catch((error) => logger.error(error))
    .finally(() => logger.trace('alarm.js - setCommuteAlarm - finally'));
}

/* Cron overview
    Seconds: 0-59
    Minutes: 0-59
    Hours: 0-23
    Day of Month: 1-31
    Months: 0-11 (Jan-Dec)
    Day of Week: 0-6 (Sun-Sat)
*/
alarmModule.dailyCommuteCron = schedule.scheduleJob('CommuteGetDailyTime', '0 0 0 * * *', setCommuteAlarm);
setCommuteAlarm(); // Run when server restarts, no need to wait for next day

module.exports = alarmModule;
logger.debug('alarmModule initialized');
