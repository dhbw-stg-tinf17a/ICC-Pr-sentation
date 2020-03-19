const ReverseGeocoder = require('../modules/reverseGeocoder');

describe('ReverseGeocoderModule', () => {
  const coordinates = { lat: 48.773563, lon: 9.171063 };
  it('getStreetFromCoordinates - should return the right street', async () => {
    try {
      const street = await ReverseGeocoder.getStreetFromCoordinates(coordinates);
      expect(street).toEqual('Stuttgart, Rotebühlplatz 41');
    } catch (error) {
      // Error comes from API, not from us
      expect(error.message && error.message.startsWith('Request failed with status code')).toBe(true);
    }
  });

  it('getAreaFromCoordinates - should return the right area', async () => {
    try {
      const area = await ReverseGeocoder.getAreaFromCoordinates(coordinates);
      expect(area).toEqual('Stuttgart-Mitte');
    } catch (error) {
      // Error comes from API, not from us
      expect(error.message && error.message.startsWith('Request failed with status code')).toBe(true);
    }
  });
});
