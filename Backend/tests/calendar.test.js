const ical = require('node-ical');
const calendar = require('../modules/calendar');
const user = require('../modules/user');

jest.mock('node-ical');
jest.mock('../modules/user');

describe('calendar module', () => {
  describe('getNextFirstEventOfDay', () => {
    it('should throw an error if no calendar URL is set', async () => {
      user.getUserPreferences.mockResolvedValue({});

      await expect(calendar.getFirstEventOfDay()).rejects.toThrow('User has not set their calendar url yet.');
    });

    it('should return the first event of today, if it did not start yet', async () => {
      user.getUserPreferences.mockResolvedValue({ calendarUrl: 'https://example.com' });

      const now = new Date();
      const inOneMinute = new Date(now.getTime());
      inOneMinute.setUTCMinutes(inOneMinute.getUTCMinutes() + 1);
      const inTwoMinutes = new Date(now.getTime());
      inTwoMinutes.setUTCMinutes(inTwoMinutes.getUTCMinutes() + 1);
      ical.async.fromURL.mockResolvedValue({
        1: { type: 'VEVENT', start: inTwoMinutes },
        2: { type: 'VEVENT', start: inOneMinute },
      });

      const event = await calendar.getNextFirstEventOfDay();
      expect(event.start).toStrictEqual(inOneMinute);
    });

    it('should return the first event of tomorrow, if the first event of today already started', async () => {
      user.getUserPreferences.mockResolvedValue({ calendarUrl: 'https://example.com' });

      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime());
      oneMinuteAgo.setUTCMinutes(oneMinuteAgo.getUTCMinutes() - 1);
      const inOneDay = new Date(now.getTime());
      inOneDay.setUTCDate(inOneDay.getUTCDate() + 1);
      ical.async.fromURL.mockResolvedValue({
        1: { type: 'VEVENT', start: inOneDay },
        2: { type: 'VEVENT', start: oneMinuteAgo },
      });

      const event = await calendar.getNextFirstEventOfDay();
      expect(event.start).toStrictEqual(inOneDay);
    });
  });
});
