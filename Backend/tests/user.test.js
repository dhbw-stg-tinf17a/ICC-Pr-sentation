const User = require('../modules/user');
const preferenceFile = require('../preferenceModule.json');

describe('UserModule', () => {
  it('should return the right city from the users preferences', async () => {
    const city = await User.getUsersCity();
    expect(city).toEqual(preferenceFile.user.preferences.weatherCity);
  });

  it('should return the right preparation time from the users preferences', async () => {
    const preparationTime = await User.getUsersPreparationTime();
    expect(preparationTime).toEqual(preferenceFile.user.preferences.preparationTimeInMinutes);
  });

  it('should return the right quoteCategory from the users preferences', async () => {
    const category = await User.getUsersQuoteCategory();
    expect(category).toEqual(preferenceFile.user.preferences.quoteCategory);
  });
});
