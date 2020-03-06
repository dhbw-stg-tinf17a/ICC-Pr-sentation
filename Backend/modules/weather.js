const weatherModule = {};

const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const weatherAPI = require('openweather-apis');
const User = require("./user");
const fallbackCity = "Stuttgart";

weatherAPI.setLang('en');
weatherAPI.setUnits('metric');
weatherAPI.setAPPID(process.env.OPENWEATHER_API_KEY);


weatherModule.getCurrentWeather = function () {
	return new Promise((resolve, reject) => {
		logger.trace("weather.js - getCurrenrWeather - start");
		getUsersCityFromUserPreferences()
			.catch((error) => {
				logger.error(error);
				return fallbackCity;
			})
			.then((city) => weatherAPI.setCity(city))
			.then(() => fetchCurrentWeather())
			.then((weather) => resolve(weather))
			.catch((error) => reject(error))
			.finally(() => logger.trace("weather.js - getCurrenrWeather - finally"));
	});
};


function getUsersCityFromUserPreferences() {
	logger.trace("weather.js - getUsersCityFromUserPreferences - start");
	return new Promise((resolve, reject) => {
		User.getUsersCity()
			.then((city) => resolve(city))
			.catch((error) => reject(error))
			.finally(() => logger.trace("weather.js - getUsersCityFromUserPreferences - finally"));
	});
}

function fetchCurrentWeather() {
	logger.trace("weather.js - fetchCurrentWeather - start");
	return new Promise((resolve, reject) => {
		weatherAPI.getSmartJSON(function(error, weatherData) {
			logger.trace("weather.js - fetchCurrentWeather - fetchReturned: " + weatherData);
			if (error) reject(error);
			else resolve(weatherData);
		});
	});
}

module.exports = weatherModule;
logger.trace("weatherModule initialized");