const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const preferenceModule = require('./preferences');
const reverseGeocoder = require('./reverseGeocoder');
const validationHandler = require('../utilities/validationHandler');

const userModule = {};

userModule.getUser = async () => {
  logger.trace('userModule - getUser - called');
  const user = preferenceModule.get('user').value();
  if (user === undefined) throw new Error('There is no user set in the preferenceModule.');
  return user;
};

userModule.setCoordinates = async (coordinates) => {
  logger.trace('userModule - setCoordinates with coordinates:');
  logger.trace(coordinates);

  const validatedCoordinates = await validationHandler.validateCoordinate(coordinates);
  preferenceModule.set('user.preferences.currentLocationCoordinates', validatedCoordinates).write();
  const coordinateArea = await reverseGeocoder.getStreetFromCoordinates(validatedCoordinates);
  preferenceModule.set('user.preferences.currentLocationAddress', coordinateArea).write();
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

userModule.getUserPreferences = async () => {
  logger.trace('userModule - getUserPreferences - start');

  const user = await userModule.getUser();
  if (user.preferences === undefined) throw new Error('User has no preferences set.');
  return user.preferences;
};

userModule.getUsersPreparationTime = async () => {
  try {
    const preferences = await userModule.getUserPreferences();
    if (preferences.preparationTimeInMinutes === undefined) {
      logger.trace("User hasn't set their preparationTime yet, using standard time of 1h");
      return 60;
    }
    return preferences.preparationTimeInMinutes;
  } catch (error) {
    return 60;
  }
};

userModule.getUsersQuoteCategory = async () => {
  const availableCategories = ['inspiration', 'management', 'life', 'sports', 'funny', 'love', 'art', 'students'];
  const defaultCategory = 'inspire';
  try {
    const preferences = await userModule.getUserPreferences();
    if (preferences.quoteCategory === undefined) {
      logger.error("User hasn't set their favourite quote category yet, using default category");
      return defaultCategory;
    }
    if (!availableCategories.includes(preferences.quoteCategory)) {
      logger.error("User's set category is faulty, using default category");
      return defaultCategory;
    }
    return preferences.quoteCategory;
  } catch (error) {
    logger.error('User has no preferences, using standard category');
    return defaultCategory;
  }
};

userModule.getFallbackQuote = async () => {
  logger.trace('userModule - getFallbackQuote - called');
  const rateLimitBackups = preferenceModule.get('rateLimitBackups').value();
  if (rateLimitBackups === undefined) throw new Error('There is no ratelimit-backup for this and the ratelimit is reached.');

  if (rateLimitBackups && rateLimitBackups.dailyQuote) return rateLimitBackups.dailyQuote;
  throw new Error('There is no ratelimit-backup for this and the ratelimit is reached.');
};

userModule.setFallbackQuote = async (quoteObject) => {
  logger.trace('userModule - setFallbackQuote - called');
  preferenceModule.set('rateLimitBackups.dailyQuote', quoteObject).write();
};

module.exports = userModule;
logger.debug('userModule initialized');
