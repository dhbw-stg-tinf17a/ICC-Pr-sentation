const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const preferenceModule = require('./preferences');
const userModule = {};

userModule.getUser = function () {
	logger.trace("userModule - getUser - called");
	return new Promise((resolve, reject) => {
		const user = preferenceModule.get("user").value();
		if (user === undefined) return reject({message: "User could not be fetched."});
		resolve(user);
	});
};

userModule.getUserPreferences = function () {
	return new Promise ((resolve, reject) => {
		this.getUser()
			.then((user) => {
				if (user.preferences === undefined) return reject({message: "User has no preferences set."});
				resolve(user.preferences);
			})
			.catch((error) => reject(error));
	});
};

userModule.getUsersPreparationTime = function () {
	return new Promise ((resolve, reject) => {
		this.getUserPreferences()
			.then((preferences) => {
				if (preferences.preparationTimeInMinutes === undefined) {
					logger.trace("User hasn't set their preparationTime yet, using standard time of 1h");
					return resolve(60);
				}
				resolve(preferences.preparationTimeInMinutes);
			})
			.catch((error) => reject(error));
	});
};


module.exports = userModule;