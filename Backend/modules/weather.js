const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const weatherAPI = require('openweather-apis');
const User = require('./user');
const validationHandler = require('../utilities/validationHandler');

const weatherModule = {};

weatherAPI.setLang('en');
weatherAPI.setUnits('metric');
weatherAPI.setAPPID(process.env.OPENWEATHER_API_KEY);

const fetchCurrentWeather = () => new Promise((resolve, reject) => {
  logger.trace('weather.js - fetchCurrentWeather - start');
  weatherAPI.getAllWeather((error, weatherData) => {
    logger.trace('weather.js - fetchCurrentWeather - fetchReturned');
    if (error || (weatherData && weatherData.cod >= 400)) {
      logger.trace('weather.js - fetchCurrentWeather - error with the openweather API');
      logger.error(error);
      reject(new Error('Error with the OpenWeather-API'));
    } else resolve(weatherData);
  });
});

// TODO test
weatherModule.getCurrentWeatherForUserLocation = async () => {
  logger.trace('weather.js - getCurrentWeatherForUserLocation - start');
  weatherAPI.setCity(null);

  try {
    const userCoordinates = await User.getUserCoordinates();
    const userCoordinatesArray = userCoordinates.split(',', 2);
    weatherAPI.setCoordinate({
      lat: userCoordinatesArray[0],
      lon: userCoordinatesArray[1],
    });
    return fetchCurrentWeather();
  } catch (error) {
    logger.error(error);
    return Promise.reject(error);
  }
};

weatherModule.getCurrentWeatherForCity = async (city) => {
  logger.trace('weather.js - getCurrentWeatherForCity - start');
  try {
    const validatedCity = await validationHandler.validateCity(city);

    weatherAPI.setCoordinate({ lat: null, lon: null });
    weatherAPI.setCity(validatedCity);

    return fetchCurrentWeather();
  } catch (error) {
    logger.error(error);
    return Promise.reject(error);
  }
};

module.exports = weatherModule;
logger.debug('weatherModule initialized');
