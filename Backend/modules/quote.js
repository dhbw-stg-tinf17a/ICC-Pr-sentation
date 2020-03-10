const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const request = require('axios');
const User = require('./user');

const quoteModule = {};
const quotesUrl = 'https://quotes.rest/qod';
const defaultQuote = 'Sometimes you must hurt in order to know, fall in order to grow, lose in order to gain because life’s greatest lessons are learned through pain.';
const availableCategories = ['inspiration', 'management', 'life', 'sports', 'funny', 'love', 'art', 'students'];
const defaultCategory = 'inspiration';

function getUsersQuoteCategoryFromUserPreferences() {
  logger.trace('quote.js - getUsersQuoteCategoryFromUserPreferences - start');
  return new Promise((resolve, reject) => {
    User.getUsersQuoteCategory()
      .then((category) => {
        if (availableCategories.includes(category)) {
          resolve(category);
          return;
        }
        reject(new Error('Quote category the user set is invalid'));
      })
      .catch((error) => reject(error))
      .finally(() => logger.trace('quote.js - getUsersQuoteCategoryFromUserPreferences - finally'));
  });
}

quoteModule.getPreferredQuoteOfTheDay = () => {
  logger.trace('quote.js - getPreferredQuoteOfTheDay - start');
  return new Promise((resolve) => {
    getUsersQuoteCategoryFromUserPreferences()
      .catch((error) => {
        logger.error(error);
        return defaultCategory;
      })
      .then((category) => request.get(quotesUrl, { params: { category } }))
      .then((response) => {
        const quote = response.data.contents.quotes[0];
        resolve(quote);
      })
      .catch((error) => {
        logger.error(error);
        resolve(defaultQuote);
      })
      .finally(() => logger.trace('quote.js - getPreferredQuoteOfTheDay - finally'));
  });
};

module.exports = quoteModule;
logger.debug('quoteModule initialized');
