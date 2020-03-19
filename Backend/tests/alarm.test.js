
const Alarm = require('../modules/alarm');

describe('AlarmModule', () => {
  it('getCurrentWeatherForCity - should return a weather object or an specific error object', async () => {
    try {
      const event = await Alarm.getFirstEventWithTimeToLeave();
      expect(event).toHaveProperty('start');
      expect(event).toHaveProperty('timeToLeave');
    } catch (error) {
      expect(error.message === 'There are no events' || error.message === 'There was an Error fetching the trip information from VVS').toBe(true);
    }
  });
});
