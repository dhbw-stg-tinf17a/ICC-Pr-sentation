const ical = require('node-ical');
const calendar = require('../modules/calendar');
const preferences = require('../modules/preferences');

jest.mock('node-ical');
jest.mock('../modules/preferences');

describe('calendar module', () => {
  describe('getFirstEventStartingBetween', () => {
    it('should throw an error if no calendar URL is set', async () => {
      preferences.get.mockResolvedValueOnce({});

      await expect(calendar.getFirstEventStartingBetween({ start: '2020-03-28T00:00:00Z', end: '2020-03-29T00:00:00Z' })).rejects.toThrow('Calendar URL is not set');
    });

    it('should return the first event of today if it did not start yet', async () => {
      const calendarURL = 'https://example.com';
      preferences.get.mockResolvedValueOnce({ calendarURL });

      const events = {
        1: { type: 'VEVENT', start: new Date('2020-03-28T08:00:00Z') },
        2: { type: 'VEVENT', start: new Date('2020-03-28T07:00:00Z') },
      };
      ical.async.fromURL.mockResolvedValueOnce(events);

      await expect(calendar.getFirstEventStartingBetween({ start: '2020-03-28T00:00:00Z', end: '2020-03-29T00:00:00Z' })).resolves.toStrictEqual(events[2]);

      // check conversion to API request (only in this test case)
      expect(ical.async.fromURL).toHaveBeenCalledTimes(1);
      expect(ical.async.fromURL).toHaveBeenCalledWith(calendarURL);
    });
  });

  describe('getFreeSlotsBetween', () => {
    it('should return all free slots during the given time', async () => {
      const calendarURL = 'https://example.com';
      preferences.get.mockResolvedValueOnce({ calendarURL });

      ical.async.fromURL.mockResolvedValueOnce({
        1: { type: 'VEVENT', start: new Date('2020-03-27T00:00Z'), end: new Date('2020-03-27T07:00Z') },
        2: { type: 'VEVENT', start: new Date('2020-03-27T12:00Z'), end: new Date('2020-03-27T15:00Z') },
        3: { type: 'VEVENT', start: new Date('2020-03-28T07:00Z'), end: new Date('2020-03-28T09:00Z') },
      });

      await expect(calendar.getFreeSlotsBetween({ start: '2020-03-27T00:00Z', end: '2020-03-27T15:00Z' })).resolves.toStrictEqual([
        { start: new Date('2020-03-27T07:00Z'), end: new Date('2020-03-27T12:00Z') },
      ]);
    });
  });
});
