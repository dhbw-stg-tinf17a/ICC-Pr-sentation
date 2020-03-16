const Weather = require('../modules/weather');

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
});
