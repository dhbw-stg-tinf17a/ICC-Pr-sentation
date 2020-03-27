const axios = require('axios').default;

const endpoint = 'https://quotes.rest/qod';

// TODO from preferences
const category = 'funny';

// TODO cache?
async function getPreferredQuoteOfTheDay() {
  try {
    const response = await axios.get(endpoint, { params: { category } });
    const { quote, author } = response.data.contents.quotes[0];
    return { quote, author };
  } catch (error) {
    if (error.response.status === 429) {
      return { quote: 'Only a stupid man would request that many quotes.', author: 'Gunter' };
    }

    throw error;
  }
}

module.exports = { endpoint, category, getPreferredQuoteOfTheDay };
