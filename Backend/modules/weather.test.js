const axios = require('axios').default;
const weather = require('./weather');

jest.mock('axios');

describe('weather module', () => {
  describe('getForecast', () => {
    it('should return the forecast', async () => {
      const response = {
        forecasts: [
          {
            date: '2020-03-24T06:00:00+00:00',
            temperature: { minimum: { value: -1.9, unit: 'C', unitType: 17 }, maximum: { value: 9.1, unit: 'C', unitType: 17 } },
            realFeelTemperature: { minimum: { value: -3.9, unit: 'C', unitType: 17 }, maximum: { value: 7.6, unit: 'C', unitType: 17 } },
            realFeelTemperatureShade: { minimum: { value: -3.9, unit: 'C', unitType: 17 }, maximum: { value: 6.2, unit: 'C', unitType: 17 } },
            hoursOfSun: 12.4,
            degreeDaySummary: { heating: { value: 14, unit: 'C', unitType: 17 }, cooling: { value: 0, unit: 'C', unitType: 17 } },
            airAndPollen: [
              {
                name: 'AirQuality', value: 32, category: 'Good', categoryValue: 1, type: 'Ozone',
              },
              {
                name: 'Grass', value: 0, category: 'Low', categoryValue: 1,
              },
              {
                name: 'Mold', value: 0, category: 'Low', categoryValue: 1,
              },
              {
                name: 'Ragweed', value: 0, category: 'Low', categoryValue: 1,
              },
              {
                name: 'Tree', value: 0, category: 'Low', categoryValue: 1,
              },
              {
                name: 'UVIndex', value: 4, category: 'Moderate', categoryValue: 2,
              },
            ],
            day: {
              iconCode: 1,
              iconPhrase: 'Sunny',
              hasPrecipitation: false,
              shortPhrase: 'Breezy in the morning; sunny',
              longPhrase: 'Breezy this morning; otherwise, chilly with plenty of sunshine',
              precipitationProbability: 0,
              thunderstormProbability: 0,
              rainProbability: 0,
              snowProbability: 0,
              iceProbability: 0,
              wind: { direction: { degrees: 89, localizedDescription: 'E' }, speed: { value: 16.7, unit: 'km/h', unitType: 7 } },
              windGust: { direction: { degrees: 105, localizedDescription: 'ESE' }, speed: { value: 50, unit: 'km/h', unitType: 7 } },
              totalLiquid: { value: 0, unit: 'mm', unitType: 3 },
              rain: { value: 0, unit: 'mm', unitType: 3 },
              snow: { value: 0, unit: 'cm', unitType: 4 },
              ice: { value: 0, unit: 'mm', unitType: 3 },
              hoursOfPrecipitation: 0,
              hoursOfRain: 0,
              hoursOfSnow: 0,
              hoursOfIce: 0,
              cloudCover: 0,
            },
            night: {
              iconCode: 33,
              iconPhrase: 'Clear',
              hasPrecipitation: false,
              shortPhrase: 'Clear and cold',
              longPhrase: 'Clear and cold',
              precipitationProbability: 0,
              thunderstormProbability: 0,
              rainProbability: 0,
              snowProbability: 0,
              iceProbability: 0,
              wind: { direction: { degrees: 86, localizedDescription: 'E' }, speed: { value: 11.1, unit: 'km/h', unitType: 7 } },
              windGust: { direction: { degrees: 92, localizedDescription: 'E' }, speed: { value: 20.4, unit: 'km/h', unitType: 7 } },
              totalLiquid: { value: 0, unit: 'mm', unitType: 3 },
              rain: { value: 0, unit: 'mm', unitType: 3 },
              snow: { value: 0, unit: 'cm', unitType: 4 },
              ice: { value: 0, unit: 'mm', unitType: 3 },
              hoursOfPrecipitation: 0,
              hoursOfRain: 0,
              hoursOfSnow: 0,
              hoursOfIce: 0,
              cloudCover: 0,
            },
            sources: ['AccuWeather'],
          },
        ],
      };
      axios.get.mockResolvedValue({
        data: response,
      });

      expect(weather.getForecast({ latitude: 48.78232, longitude: 9.17702, duration: 1 }))
        .resolves.toStrictEqual(response.forecasts);

      // check conversion to API request
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(weather.endpoint, {
        params: {
          'subscription-key': process.env.AZURE_MAPS_KEY, 'api-version': '1.0', query: '48.78232,9.17702', duration: 1,
        },
      });
    });
  });
});
