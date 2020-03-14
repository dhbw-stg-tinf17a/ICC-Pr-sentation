const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const request = require('axios');
const User = require('./user');

const quoteModule = {};
const quotesUrl = 'https://quotes.rest/qod';
const defaultQuote = 'Sometimes you must hurt in order to know, fall in order to grow, lose in order to gain because life’s greatest lessons are learned through pain.';

quoteModule.getPreferredQuoteOfTheDay = async () => {
  logger.trace('quote.js - getPreferredQuoteOfTheDay - called');
  const quoteCategory = await User.getUsersQuoteCategory();
  try {
    const quoteResponse = await request.get(quotesUrl, { params: { category: quoteCategory } });
    return quoteResponse.data.contents.quotes[0];
  } catch (error) {
    throw new Error('Couldn\'t fetch quote of the day');
  }
};

module.exports = quoteModule;
logger.debug('quoteModule initialized');
