const ReverseGeocoder = require('../modules/reverseGeocoder');

describe('ReverseGeocoderModule', () => {
  it('getStreetFromCoordinates - should return the right street', async () => {
    const street = await ReverseGeocoder.getStreetFromCoordinates('48.773563,9.171063');
    expect(street).toEqual('Stuttgart, Rotebühlplatz 41');
  });

  it('getAreaFromCoordinates - should return the right area', async () => {
    const area = await ReverseGeocoder.getAreaFromCoordinates('48.773563,9.171063');
    expect(area).toEqual('Stuttgart-Mitte');
  });
});
