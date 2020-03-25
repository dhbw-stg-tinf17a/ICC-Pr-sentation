const pino = require('pino');
const request = require('axios').default;
const User = require('./user');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const endpoint = 'https://quotes.rest/qod';

async function getPreferredQuoteOfTheDay() {
  const quoteCategory = await User.getUsersQuoteCategory();
  try {
    const quoteResponse = await request.get(endpoint, { params: { category: quoteCategory } });
    const quoteObject = quoteResponse.data.contents.quotes[0];
    User.setFallbackQuote(quoteObject);
    return quoteObject;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      logger.error('Quote ratelimit reached -> trying to use fallback saved daily quote');
      try {
        const fallbackQuote = await User.getFallbackQuote();
        return fallbackQuote;
      } catch (fallbackError) {
        throw new Error('Could not fetch fallback quote of the day');
      }
    }
    throw new Error('Could not fetch quote of the day');
  }
}

module.exports = { getPreferredQuoteOfTheDay };
