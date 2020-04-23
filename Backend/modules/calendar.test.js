const ical = require('node-ical');
const calendar = require('./calendar');
const preferences = require('./preferences');

jest.mock('node-ical');
jest.mock('./preferences');

describe('calendar module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventsStartingBetween', () => {
    it('should return all events starting during the given time', async () => {
      const calendarURL = 'https://example.com';
      preferences.getChecked.mockResolvedValueOnce({ calendarURL });

      const events = {
        1: { type: 'VEVENT', start: new Date('2020-03-28T08:00:00Z') },
        2: { type: 'VEVENT', start: new Date('2020-03-29T06:00:00Z') },
        3: { type: 'VEVENT', start: new Date('2020-03-28T07:00:00Z') },
      };
      ical.async.fromURL.mockResolvedValueOnce(events);

      await expect(calendar.getEventsStartingBetween({ start: '2020-03-28T00:00:00Z', end: '2020-03-29T00:00:00Z' })).resolves.toStrictEqual([events[3], events[1]]);
    });
  });

  describe('getFreeSlotsBetween', () => {
    it('should return all free slots during the given time', async () => {
      const calendarURL = 'https://example.com';
      preferences.getChecked.mockResolvedValueOnce({ calendarURL });

      ical.async.fromURL.mockResolvedValueOnce({
        1: { type: 'VEVENT', start: new Date('2020-03-27T00:00Z'), end: new Date('2020-03-27T07:00Z') },
        2: { type: 'VEVENT', start: new Date('2020-03-27T12:00Z'), end: new Date('2020-03-27T15:00Z') },
        3: { type: 'VEVENT', start: new Date('2020-03-28T07:00Z'), end: new Date('2020-03-28T09:00Z') },
      });

      await expect(calendar.getFreeSlotsBetween({
        start: '2020-03-27T00:00Z',
        end: '2020-03-27T15:00Z',
      })).resolves.toStrictEqual([
        { start: new Date('2020-03-27T07:00Z'), end: new Date('2020-03-27T12:00Z') },
      ]);

      expect(ical.async.fromURL).toHaveBeenCalledTimes(1);
      expect(ical.async.fromURL).toHaveBeenCalledWith(calendarURL);
    });
  });
});
