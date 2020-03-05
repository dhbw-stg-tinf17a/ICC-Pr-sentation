const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const preferenceModule = require('./preferenceModule');
const userModule = {};

userModule.getUser = function () {
	logger.trace("userModule - getUser - called");
	return new Promise((resolve, reject) => {
		resolve(preferenceModule.get("user").value());
	});
};


module.exports = userModule;