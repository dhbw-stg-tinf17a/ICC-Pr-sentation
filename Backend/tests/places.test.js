const Places = require('../modules/places');

const typeOf = (x) => Object.prototype.toString.call(x).slice(8, -1).toLowerCase();

describe('PlacesModule', () => {
  it('getRestaurantsNearUser - should return an array with restaurants', async () => {
    try {
      const restaurants = await Places.getRestaurantsNearUser();
      expect(typeOf(restaurants)).toEqual('array');
      if (restaurants.length > 0) expect(restaurants[0].type).toEqual('restaurant');
    } catch (error) {
      expect(error).toEqual(new Error('Error with the OpenWeather-API'));
    }
  });
});
