const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const weatherAPI = require('openweather-apis');
const User = require('./user');

const fallbackCity = 'Stuttgart';
const weatherModule = {};

weatherAPI.setLang('en');
weatherAPI.setUnits('metric');
weatherAPI.setAPPID(process.env.OPENWEATHER_API_KEY);

function getUsersCityFromUserPreferences() {
  logger.trace('weather.js - getUsersCityFromUserPreferences - start');
  return new Promise((resolve, reject) => {
    User.getUsersCity()
      .then((city) => resolve(city))
      .catch((error) => reject(error))
      .finally(() => logger.trace('weather.js - getUsersCityFromUserPreferences - finally'));
  });
}

function fetchCurrentWeather() {
  logger.trace('weather.js - fetchCurrentWeather - start');
  return new Promise((resolve, reject) => {
    weatherAPI.getAllWeather((error, weatherData) => {
      logger.trace('weather.js - fetchCurrentWeather - fetchReturned');
      // logger.trace(weatherData);
      if (error || (weatherData && weatherData.cod >= 400)) {
        logger.trace('weather.js - fetchCurrentWeather - error with the openweather API');
        logger.error(error);
        reject(new Error('Error with the OpenWeather-API'));
      } else resolve(weatherData);
    });
  });
}

weatherModule.getCurrentWeather = () => new Promise((resolve, reject) => {
  logger.trace('weather.js - getCurrentWeather - start');
  getUsersCityFromUserPreferences()
    .catch((error) => {
      logger.error(error);
      return fallbackCity;
    })
    .then((city) => weatherAPI.setCity(city))
    .then(() => fetchCurrentWeather())
    .then((weather) => resolve(weather))
    .catch((error) => {
      logger.error(error);
      reject(error);
    })
    .finally(() => logger.trace('weather.js - getCurrentWeather - finally'));
});

module.exports = weatherModule;
logger.debug('weatherModule initialized');
