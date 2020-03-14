
const Alarm = require('../modules/alarm');

describe.skip('AlarmModule', () => {
  it('getCurrentWeatherForCity - should return a weather object or an specific error object', async () => {
    try {
      const event = await Alarm.getFirstEventWithTimeToLeave();
      expect(event).toHaveProperty('start');
      expect(event).toHaveProperty('timeToLeave');
    } catch (error) {
      expect(error).toEqual(new Error());
    }
  });
});
