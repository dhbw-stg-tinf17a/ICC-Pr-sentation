const Calendar = require('../modules/calendar');

describe('CalendarModule', () => {
  it('getTodaysFirstEvent - should return a calendar event or throw a specific error object', async () => {
    try {
      const calendar = await Calendar.getTodaysFirstEvent();
      expect(calendar).toHaveProperty('start');
    } catch (error) {
      expect(error).toEqual(new Error('There are no events'));
    }
  });
});
