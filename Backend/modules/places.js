const axios = require('axios').default;

const endpoint = 'https://atlas.microsoft.com/search/poi/category/json';

// supported categories: https://docs.microsoft.com/en-us/azure/azure-maps/supported-search-categories
async function getPOIsAround({
  latitude, longitude, category, radius, limit,
}) {
  const response = await axios.get(endpoint, {
    params: {
      'subscription-key': process.env.AZURE_MAPS_KEY,
      'api-version': '1.0',
      query: category,
      lat: latitude,
      lon: longitude,
      radius: radius * 1000,
      limit,
    },
  });

  return response.data;
}

module.exports = { endpoint, getPOIsAround };
