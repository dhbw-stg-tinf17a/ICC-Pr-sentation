const pino = require('pino');
const preferenceModule = require('./preferences');
const reverseGeocoder = require('./reverseGeocoder');
const validationSchemas = require('../utilities/validation-schemas');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

async function getUser() {
  const user = preferenceModule.get('user').value();
  if (user === undefined) throw new Error('There is no user set in the preferenceModule.');
  return user;
}

async function setCoordinates(coordinates) {
  logger.trace(`userModule - setCoordinates with coordinates ${coordinates}`);
  const validatedCoordinates = await validationSchemas.coordinates.validateAsync(coordinates);
  preferenceModule.set('user.preferences.currentLocationCoordinates', validatedCoordinates).write();
  const coordinateArea = await reverseGeocoder.getStreetFromCoordinates(validatedCoordinates);
  preferenceModule.set('user.preferences.currentLocationAddress', coordinateArea).write();
  return Promise.resolve('Your current coordinates have been set successfully');
}

async function getUserPreferences() {
  const user = await getUser();
  if (user.preferences === undefined) throw new Error('User has no preferences set.');
  return user.preferences;
}

async function getUserCoordinates() {
  const preferences = await getUserPreferences();
  if (preferences.currentLocationCoordinates === undefined) {
    throw new Error('We do not have the user coordinates yet');
  }
  return preferences.currentLocationCoordinates;
}

async function getUsersPreparationTime() {
  try {
    const preferences = await getUserPreferences();
    if (preferences.preparationTimeInMinutes === undefined) {
      logger.trace('User has not set their preparationTime yet, using standard time of 1h');
      return 60;
    }
    return preferences.preparationTimeInMinutes;
  } catch (error) {
    return 60;
  }
}

async function getUsersQuoteCategory() {
  const availableCategories = ['inspiration', 'management', 'life', 'sports', 'funny', 'love', 'art', 'students'];
  const defaultCategory = 'inspire';
  try {
    const preferences = await getUserPreferences();
    if (preferences.quoteCategory === undefined) {
      logger.trace('User has not set their favourite quote category, using default category');
      return defaultCategory;
    }
    if (!availableCategories.includes(preferences.quoteCategory)) {
      logger.error('User has set a faulty quote category, using default category');
      return defaultCategory;
    }
    return preferences.quoteCategory;
  } catch (error) {
    logger.trace('User has no preferences, using default quote category');
    return defaultCategory;
  }
}

async function getFallbackQuote() {
  const rateLimitBackups = preferenceModule.get('rateLimitBackups').value();
  if (rateLimitBackups === undefined) throw new Error('There is no ratelimit-backup for this and the ratelimit is reached.');

  if (rateLimitBackups && rateLimitBackups.dailyQuote) return rateLimitBackups.dailyQuote;
  throw new Error('There is no ratelimit-backup for this and the ratelimit is reached.');
}

async function setFallbackQuote(quoteObject) {
  preferenceModule.set('rateLimitBackups.dailyQuote', quoteObject).write();
}

module.exports = {
  getUser,
  setCoordinates,
  getUserCoordinates,
  getUserPreferences,
  getUsersPreparationTime,
  getUsersQuoteCategory,
  getFallbackQuote,
  setFallbackQuote,
};
