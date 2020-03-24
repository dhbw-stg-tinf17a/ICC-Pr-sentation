const axios = require('axios').default;

const endpoint = 'https://atlas.microsoft.com/weather/forecast/daily/json';

// duration can be 1, 5, or 10
async function getForecast({ latitude, longitude, duration }) {
  const response = await axios.get(endpoint, {
    params: {
      'subscription-key': process.env.AZURE_MAPS_KEY,
      'api-version': '1.0',
      query: `${latitude},${longitude}`,
      duration,
    },
  });

  return response.data;
}

module.exports = { endpoint, getForecast };
