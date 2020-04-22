const schedule = require('node-schedule');
const fakeTimers = require('@sinonjs/fake-timers');
const morningRoutine = require('../morning-routine');
const notifications = require('../../modules/notifications');
const quote = require('../../modules/quote');
const preferences = require('../../modules/preferences');

jest.mock('../../modules/notifications');
jest.mock('../../modules/quote');
jest.mock('../../modules/preferences');

const now = new Date('2020-01-15T08:00:00Z');
const clock = fakeTimers.install({ now });

const scheduleJobSpy = jest.spyOn(schedule, 'scheduleJob');

const pref = preferences.defaults;
preferences.get.mockResolvedValue(pref);

notifications.sendNotification.mockResolvedValue();

describe('morning routine use case', () => {
  afterAll(() => {
    clock.uninstall();
  });

  afterEach(() => {
    jest.clearAllMocks();
    clock.reset();
    Object.values(schedule.scheduledJobs).forEach((job) => job.cancel());
  });

  describe('init', () => {
    it('should work', async () => {
      morningRoutine.init();
      expect(scheduleJobSpy).toHaveBeenCalledWith(
        {
          minute: 0, hour: 0, dayOfWeek: [1, 2, 3, 4, 5], tz: 'Europe/Berlin',
        },
        morningRoutine.run,
      );
    });
  });

  describe('run', () => {
    it('should work', async () => {

    });
  });

  describe('getQuoteOfTheDay', () => {
    it('should return the quote of the day', async () => {
      const qod = {
        quote: 'Only a stupid man would request that many quotes.',
        author: 'Gunter',
      };
      quote.getQuoteOfTheDay.mockResolvedValueOnce(qod);

      await expect(morningRoutine.getQuoteOfTheDay(pref)).resolves.toStrictEqual(qod);
    });
  });
});
