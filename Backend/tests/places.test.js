const axios = require('axios').default;
const places = require('../modules/places');

jest.mock('axios');

process.env.AZURE_MAPS_KEY = 'AZURE_MAPS_KEY';

describe('places module', () => {
  describe('getPOIsAround', () => {
    it('should return matching POIs', async () => {
      const response = {
        summary: {
          query: 'restaurant', queryType: 'NON_NEAR', queryTime: 16, numResults: 1, offset: 0, totalResults: 1, fuzzyLevel: 1, geoBias: { lat: 48.78232, lon: 9.17702 },
        },
        results: [{
          type: 'POI',
          id: 'DE/POI/p0/2437161',
          score: 2.5745298862457275,
          dist: 60.24484780914825,
          info: 'search:ta:276009023724492-DE',
          poi: {
            name: 'Valle Bar/Restaurant', phone: '+(49)-(711)-2202727', categorySet: [{ id: 7315025 }], url: 'www.ristorante-valle.de', categories: ['italian', 'restaurant'], classifications: [{ code: 'RESTAURANT', names: [{ nameLocale: 'en-US', name: 'restaurant' }, { nameLocale: 'en-US', name: 'italian' }] }],
          },
          address: {
            streetNumber: '3', streetName: 'Geschwister-Scholl-Straße', municipalitySubdivision: 'Stuttgart-Mitte', municipality: 'Stuttgart', countrySecondarySubdivision: 'Stuttgart', countrySubdivision: 'Baden-Württemberg', postalCode: '70174', countryCode: 'DE', country: 'Deutschland', countryCodeISO3: 'DEU', freeformAddress: 'Geschwister-Scholl-Straße 3, 70174 Stuttgart', localName: 'Stuttgart',
          },
          position: { lat: 48.78236, lon: 9.1762 },
          viewport: {
            topLeftPoint: { lat: 48.78326, lon: 9.17484 },
            btmRightPoint: { lat: 48.78146, lon: 9.17756 },
          },
          entryPoints: [{ type: 'main', position: { lat: 48.78249, lon: 9.17612 } }],
        }],
      };
      axios.get.mockResolvedValueOnce({ data: response });

      expect(places.getPOIsAround({
        latitude: 48.78232, longitude: 9.17702, category: 'RESTAURANT', limit: 1, radius: 2,
      })).resolves.toStrictEqual(response.results);

      // check conversion to API request
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(places.endpoint, {
        params: {
          'subscription-key': process.env.AZURE_MAPS_KEY, 'api-version': '1.0', lat: 48.78232, lon: 9.17702, query: 'RESTAURANT', limit: 1, radius: 2000,
        },
      });
    });
  });
});
