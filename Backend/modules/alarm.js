const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const schedule = require('node-schedule');
const moment = require('moment');
const webpush = require('web-push');
const calendar = require('./calendar');
const User = require('./user');
const vvs = require('./vvs');
const { getSubscriptions } = require('./notifications');

const alarmModule = {};
const dailyCommuteJobName = 'CommuteWakeUpAlarm';

function getTimeToLeave() {
  logger.trace('alarm.js - getTimeToLeave - start');
  return new Promise((resolve, reject) => {
    let event;
    calendar.getTodaysFirstEvent()
      .then((calendarEvent) => {
        event = calendarEvent;
        logger.trace(`alarm.js - getTimeToLeave: Event starts at: ${moment(event.start).format('DD.MM HH:mm')}`);
        if (event.location) {
          return vvs.getLastPossibleConnectionStartTime(event.start, event.location);
        }

        logger.trace('alarm.js - getTimeToLeave: Event has no set location.');
        return event.start;
      })
      .then((time) => {
        event.timeToLeave = time;
        logger.trace(`alarm.js - getTimeToLeave: Time to leave for event: ${time.format('DD.MM HH:mm')}`);
        resolve(event);
      })
      .catch((error) => {
        logger.error(error);
        reject(error);
      })
      .finally(() => logger.trace('alarm.js - getTimeToLeave - finally'));
  });
}

async function wakeUpUser(event) {
  logger.debug(`Hey, listen. Please wake up, there is an event you wanted to attend: ${event.title}`);

  const subscriptions = await getSubscriptions();
  subscriptions.forEach((subscription) => webpush.sendNotification(subscription, JSON.stringify({
    title: 'A notification from Gunter!',
    options: {
      body: 'It works :)',
      icon: '/favicon.jpg',
      badge: '/badge.png',
    },
  })));
}

function setCommuteAlarm() {
  logger.trace('alarm.js - setCommuteAlarm - start');
  Promise.all([User.getUsersPreparationTime(), getTimeToLeave()])
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
