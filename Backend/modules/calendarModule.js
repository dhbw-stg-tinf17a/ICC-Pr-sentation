/**
 * This is currently just a mock
 */

const calendarModule = {};

const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const User = require("../modules/userModule");
const moment = require('moment');
const timeFormat = "YYYY-MM-DD HH:mm:ss";
logger.trace("calendarModule initialized - this is just a mock, please implement");

calendarModule.getTodaysFirstEvent = function() {
	return new Promise((resolve, reject) => {
		User.getUser()
			.then((user) => {
				if (!user.events || user.events.length == 0) return reject({message: "User hasn't set any alarms yet"});

				let nextEvent;
				const now = moment();
				const today = now.dayOfYear();

				user.events.forEach(event => {
					const eventDate = moment(event.date, timeFormat);
					if (eventDate.dayOfYear() != today) return;
					if (nextEvent === undefined || eventDate.isBefore(nextEvent.date)) nextEvent = event;
				});

				if (nextEvent == null) reject({message: "There are no events today"});
				nextEvent.date = moment(nextEvent.date, timeFormat).toDate();
				return resolve(nextEvent);
			});

	});
};


module.exports = calendarModule;