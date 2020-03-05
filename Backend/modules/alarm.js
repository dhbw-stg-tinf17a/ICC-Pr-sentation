const alarmModule = {};

const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const calendar = require('./calendar');
const schedule = require('node-schedule');
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
	calendar.getTodaysFirstEvent()
		.then((event) => {
			if (alarmModule.dailyCommuteJob === undefined) alarmModule.dailyCommuteJob = schedule.scheduleJob(dailyCommuteJobName, event.start, wakeUpUser);
			else alarmModule.dailyCommuteJob.reschedule(dailyCommuteJobName, event.start, wakeUpUser);
			logger.trace("Setting alarm for event: " + event.summary);
		})
		.catch((error) => logger.error(error));
}

function wakeUpUser(event) {
	logger.debug("Hey, listen. Please wake up, there is an event you wanted to attend: " + event.title);
}


module.exports = alarmModule;
logger.trace("alarmModule initialized");