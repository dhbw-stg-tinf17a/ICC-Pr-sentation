const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const preferenceModule = require('./preferences');
const reverseGeocoder = require('./reverseGeocoder');
const validationHandler = require('../utilities/validationHandler');

const userModule = {};

userModule.getUser = () => {
  logger.trace('userModule - getUser - called');
  return new Promise((resolve, reject) => {
    const user = preferenceModule.get('user').value();
    if (user === undefined) {
      reject(new Error('User could not be fetched.'));
      return;
    }

    resolve(user);
  });
};

userModule.setCoordinates = async (coordinatesObject) => {
  logger.trace('userModule - setCoordinates with coordinates:');
  logger.trace(coordinatesObject);

  const validatedCoordinatesObject = await validationHandler.validateCoordinate(coordinatesObject);
  const coordinatesString = `${validatedCoordinatesObject.lat},${validatedCoordinatesObject.lon}`;
  preferenceModule.set('user.preferences.currentLocationCoordinates', coordinatesString).write();
  const coordinateArea = await reverseGeocoder.getStreetFromCoordinates(validatedCoordinatesObject);
  preferenceModule.set('user.preferences.weatherCity', coordinateArea).write();
  return Promise.resolve('Your current coordinates have been set successfully');
};

userModule.getUserCoordinates = () => new Promise((resolve, reject) => {
  logger.trace('userModule - getUserCoordinates - start');
  userModule.getUserPreferences()
    .then((preferences) => {
      if (preferences.currentLocationCoordinates === undefined) {
        logger.trace("We don't have the user's coordinates yet");
        return reject(new Error("We don't have the user's coordinates yet"));
      }
      return resolve(preferences.currentLocationCoordinates);
    })
    .catch((error) => reject(error));
});

userModule.getUserPreferences = () => new Promise((resolve, reject) => {
  logger.trace('userModule - getUserPreferences - start');
  userModule.getUser()
    .then((user) => {
      if (user.preferences === undefined) {
        reject(new Error('User has no preferences set.'));
        return;
      }
      resolve(user.preferences);
    })
    .catch((error) => reject(error));
});

userModule.getUsersPreparationTime = () => new Promise((resolve, reject) => {
  userModule.getUserPreferences()
    .then((preferences) => {
      if (preferences.preparationTimeInMinutes === undefined) {
        logger.trace("User hasn't set their preparationTime yet, using standard time of 1h");
        resolve(60);
        return;
      }
      resolve(preferences.preparationTimeInMinutes);
    })
    .catch((error) => reject(error));
});

userModule.getUsersQuoteCategory = () => new Promise((resolve, reject) => {
  userModule.getUserPreferences()
    .then((preferences) => {
      if (preferences.quoteCategory === undefined) {
        logger.trace("User hasn't set their favourite quote category yet, using standard category");
        reject(new Error("User hasn't set their favourite quote category yet, using standard category"));
        return;
      }
      resolve(preferences.quoteCategory);
    })
    .catch((error) => reject(error));
});

userModule.getUsersCity = () => new Promise((resolve, reject) => {
  userModule.getUserPreferences()
    .then((preferences) => {
      if (preferences.weatherCity === undefined) {
        logger.trace("User hasn't set their city yet, using Stuttgart as fallback");
        reject(new Error("User hasn't set their city yet, using Stuttgart as fallback"));
        return;
      }
      resolve(preferences.weatherCity);
    })
    .catch((error) => reject(error));
});


module.exports = userModule;
logger.debug('userModule initialized');
