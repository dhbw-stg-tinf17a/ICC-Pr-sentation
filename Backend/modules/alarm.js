const alarmModule = {};

const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const calendar = require('./calendar');
const schedule = require('node-schedule');
const User = require("./user");
const moment = require('moment');
const dailyCommuteJobName = "CommuteWakeUpAlarm";
alarmModule.dailyCommuteJob;


/* Cron overview
    Seconds: 0-59
    Minutes: 0-59
    Hours: 0-23
    Day of Month: 1-31
    Months: 0-11 (Jan-Dec)
    Day of Week: 0-6 (Sun-Sat)
*/
alarmModule.dailyCommuteCron = schedule.scheduleJob("CommuteGetDailyTime", '* * 0 * * *', setCommuteAlarm);
setCommuteAlarm(); // Run when server restarts, no need to wait for next day

function setCommuteAlarm() {
	
	Promise.all([User.getUsersPreparationTime(), calendar.getTodaysFirstEvent()])
		.then((promiseValues) => {
			const preparationTimeInMinutes = promiseValues[0];
			const event = promiseValues[1];

			const wakeTime = moment(event.start).subtract(preparationTimeInMinutes, 'minutes').toDate();

			if (alarmModule.dailyCommuteJob === undefined) alarmModule.dailyCommuteJob = schedule.scheduleJob(dailyCommuteJobName, wakeTime, wakeUpUser);
			else alarmModule.dailyCommuteJob.reschedule(dailyCommuteJobName, wakeTime, wakeUpUser);
			logger.trace("Setting alarm for event: " + event.summary + " at " + wakeTime.toLocaleTimeString('de-DE'));
		})
		.catch((error) => logger.error(error));
}

function wakeUpUser(event) {
	logger.debug("Hey, listen. Please wake up, there is an event you wanted to attend: " + event.title);
}


module.exports = alarmModule;
logger.trace("alarmModule initialized");