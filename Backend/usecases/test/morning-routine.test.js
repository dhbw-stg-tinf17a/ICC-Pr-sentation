const schedule = require('node-schedule');
const fakeTimers = require('@sinonjs/fake-timers');
const morningRoutine = require('../morning-routine');
const notifications = require('../../modules/notifications');
const quote = require('../../modules/quote');
const preferences = require('../../modules/preferences');
const calendar = require('../../modules/calendar');

jest.mock('../../modules/notifications');
jest.mock('../../modules/quote');
jest.mock('../../modules/preferences');
jest.mock('../../modules/calendar');

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
    it('should call schedule run', async () => {
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
    it('should send a notification if there is an upcoming event', async () => {
      const event = {
        start: new Date('2020-01-15T10:00:00Z'),
        end: new Date('2020-01-15T15:00:00Z'),
        summary: 'A beautiful day',
      };
      calendar.getEventsStartingBetween.mockResolvedValueOnce([event]);

      await morningRoutine.run();

      expect(scheduleJobSpy).toHaveBeenCalledTimes(1);
      expect(notifications.sendNotifications).not.toHaveBeenCalled();

      clock.tick(event.start - now - pref.morningRoutineMinutesForPreparation * 60 * 1000);

      expect(notifications.sendNotifications).toHaveBeenCalled();
      expect(notifications.sendNotifications).toHaveBeenLastCalledWith({
        title: 'Wake up!',
        options: {
          body: 'A beautiful day starts at 11:00.',
          icon: '/favicon.jpg',
          badge: '/badge.png',
          data: {
            usecase: 'morning-routine',
          },
        },
      });
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
