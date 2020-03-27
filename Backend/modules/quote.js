const pino = require('pino');
const axios = require('axios').default;

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const endpoint = 'https://quotes.rest/qod';

// TODO from preferences
const quoteCategory = 'funny';

async function getPreferredQuoteOfTheDay() {
  try {
    const response = await axios.get(endpoint, { params: { category: quoteCategory } });
    const { quote, author } = response.data.contents.quotes[0];
    return { quote, author };
  } catch (error) {
    if (error.response && error.response.status === 429) {
      return { quote: 'Only a stupid man would request that many quotes.', author: 'Gunter' };
    }

    throw error;
  }
}

module.exports = { endpoint, getPreferredQuoteOfTheDay };
