const ical = require('node-ical');
const calendar = require('../modules/calendar');
const preferences = require('../modules/preferences');

jest.mock('node-ical');
jest.mock('../modules/preferences');

describe('calendar module', () => {
  describe('getNextFirstEventOfDay', () => {
    it('should throw an error if no calendar URL is set', async () => {
      preferences.get.mockResolvedValue({});

      await expect(calendar.getNextFirstEventOfDay()).rejects.toThrow('Calendar URL is not set');
    });

    it('should return the first event of today if it did not start yet', async () => {
      const calendarURL = 'https://example.com';
      preferences.get.mockResolvedValue({ calendarURL });

      const now = new Date();
      const inOneMinute = new Date(now.getTime());
      inOneMinute.setUTCMinutes(inOneMinute.getUTCMinutes() + 1);
      const inTwoMinutes = new Date(now.getTime());
      inTwoMinutes.setUTCMinutes(inTwoMinutes.getUTCMinutes() + 1);
      const events = {
        1: { type: 'VEVENT', start: inTwoMinutes },
        2: { type: 'VEVENT', start: inOneMinute },
      };
      ical.async.fromURL.mockResolvedValue(events);

      await expect(calendar.getNextFirstEventOfDay()).resolves.toStrictEqual(events[2]);

      // check conversion to API request (only in this test case)
      expect(ical.async.fromURL).toHaveBeenLastCalledWith(calendarURL);
    });

    it('should return the first event of tomorrow if the first event of today already started', async () => {
      const calendarURL = 'https://example.com';
      preferences.get.mockResolvedValue({ calendarURL });

      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime());
      oneMinuteAgo.setUTCMinutes(oneMinuteAgo.getUTCMinutes() - 1);
      const inOneDay = new Date(now.getTime());
      inOneDay.setUTCDate(inOneDay.getUTCDate() + 1);
      const events = {
        1: { type: 'VEVENT', start: inOneDay },
        2: { type: 'VEVENT', start: oneMinuteAgo },
      };
      ical.async.fromURL.mockResolvedValue(events);

      await expect(calendar.getNextFirstEventOfDay()).resolves.toStrictEqual(events[1]);
    });
  });

  describe('getFreeSlots', () => {
    it('should return all free slots during the given time', async () => {
      const calendarURL = 'https://example.com';
      preferences.get.mockResolvedValue({ calendarURL });

      ical.async.fromURL.mockResolvedValue({
        1: { type: 'VEVENT', start: new Date('2020-03-27T00:00Z'), end: new Date('2020-03-27T07:00Z') },
        2: { type: 'VEVENT', start: new Date('2020-03-27T12:00Z'), end: new Date('2020-03-27T15:00Z') },
        3: { type: 'VEVENT', start: new Date('2020-03-28T07:00Z'), end: new Date('2020-03-28T09:00Z') },
      });

      await expect(calendar.getFreeSlots({ start: '2020-03-27T00:00Z', end: '2020-03-27T15:00Z' })).resolves.toStrictEqual([
        { start: new Date('2020-03-27T07:00Z'), end: new Date('2020-03-27T12:00Z') },
      ]);
    });
  });
});
