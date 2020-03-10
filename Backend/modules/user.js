const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const preferenceModule = require('./preferences');
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

userModule.setCoordinates = (coordinatesObject) => new Promise((resolve, reject) => {
  logger.trace('userModule - setCoordinates with coordinates:');
  logger.trace(coordinatesObject);

  validationHandler.validateCoordinate(coordinatesObject)
    .then((validatedCoordinatesObject) => (`${validatedCoordinatesObject.lat},${validatedCoordinatesObject.lon}`))
    .then((coordinates) => preferenceModule.set('user.preferences.currentLocationCoordinates', coordinates).write())
    .then(() => resolve('Your current coordinates have been set successfully'))
    .catch((error) => {
      logger.error(error);
      reject(error);
    })
    .finally(() => logger.trace('userModule - setCoordinates - finally'));
});

userModule.getUserPreferences = () => new Promise((resolve, reject) => {
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
