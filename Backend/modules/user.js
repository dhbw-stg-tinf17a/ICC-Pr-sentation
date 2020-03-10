const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const preferenceModule = require('./preferences');
const validationHandler = require('../utilities/validationHandler');
const userModule = {};

userModule.getUser = function () {
	logger.trace("userModule - getUser - called");
	return new Promise((resolve, reject) => {
		const user = preferenceModule.get("user").value();
		if (user === undefined) return reject(new Error("User could not be fetched."));
		resolve(user);
	});
};

userModule.setCoordinates = function (coordinatesObject) {
	return new Promise ((resolve, reject) => {
		logger.trace('userModule - setCoordinates with coordinates:');
		logger.trace(coordinatesObject);

		validationHandler.validateCoordinate(coordinatesObject)
			.then((validatedCoordinatesObject) => (validatedCoordinatesObject.lat + "," + validatedCoordinatesObject.lon))
			.then((coordinates) => preferenceModule.set('user.preferences.currentLocationCoordinates', coordinates).write())
			.then(() => resolve("Your current coordinates have been set successfully"))
			.catch((error) => {
				logger.error(error);
				reject(error);
			})
			.finally(() => logger.trace('userModule - setCoordinates - finally'));
	});
};

userModule.getUserPreferences = function () {
	return new Promise ((resolve, reject) => {
		this.getUser()
			.then((user) => {
				if (user.preferences === undefined) return reject(new Error("User has no preferences set."));
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

userModule.getUsersQuoteCategory = function () {
	return new Promise ((resolve, reject) => {
		this.getUserPreferences()
			.then((preferences) => {
				if (preferences.quoteCategory === undefined) {
					logger.trace("User hasn't set their favourite quote category yet, using standard category");
					return reject(new Error ("User hasn't set their favourite quote category yet, using standard category"));
				}
				resolve(preferences.quoteCategory);
			})
			.catch((error) => reject(error));
	});
};

userModule.getUsersCity = function () {
	return new Promise ((resolve, reject) => {
		this.getUserPreferences()
			.then((preferences) => {
				if (preferences.weatherCity === undefined) {
					logger.trace("User hasn't set their city yet, using Stuttgart as fallback");
					return reject(new Error ("User hasn't set their city yet, using Stuttgart as fallback"));
				}
				resolve(preferences.weatherCity);
			})
			.catch((error) => reject(error));
	});
};


module.exports = userModule;
logger.debug("userModule initialized");