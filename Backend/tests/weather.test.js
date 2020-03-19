const request = require('supertest');
const Weather = require('../modules/weather');
const app = require('../app');

describe('WeatherModule', () => {
  it('getCurrentWeatherForCity - should return a weather object or an specific error object', async () => {
    try {
      const weather = await Weather.getCurrentWeatherForCity('Stuttgart');
      expect(weather).toHaveProperty('weather');
      expect(weather).toHaveProperty('main');
      expect(weather).toHaveProperty('cod');
      expect(weather.cod).toEqual(200);
    } catch (error) {
      expect(error).toEqual(new Error('Error with the OpenWeather-API'));
    }
  });

  it('route - /weather - should return a weather object or an specific error object', async () => {
    try {
      const response = await request(app)
        .get('/api/weather')
        .send();
      expect(response.status).toEqual(200);
      const weather = response.body;
      expect(weather).toHaveProperty('data');
      expect(weather).toHaveProperty('status');
      expect(weather.status).toEqual(200);
      expect(weather.data).toHaveProperty('weather');
      expect(weather.data).toHaveProperty('main');
      expect(weather.data).toHaveProperty('cod');
      expect(weather.data.cod).toEqual(200);
    } catch (error) {
      // Make sure that error is controlled by us
      expect(error.status).toEqual(500);
    }
  });

  it('route - /weather/Stuttgart - should return a weather object or an specific error object', async () => {
    try {
      const response = await request(app)
        .get('/api/weather/Stuttgart')
        .send();
      expect(response.status).toEqual(200);
      const weather = response.body;
      expect(weather).toHaveProperty('data');
      expect(weather).toHaveProperty('status');
      expect(weather.status).toEqual(200);
      expect(weather.data).toHaveProperty('weather');
      expect(weather.data).toHaveProperty('main');
      expect(weather.data).toHaveProperty('cod');
      expect(weather.data.cod).toEqual(200);
    } catch (error) {
      // Make sure that error is controlled by us
      expect(error.status).toEqual(500);
    }
  });
});
