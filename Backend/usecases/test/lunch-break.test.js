const schedule = require('node-schedule');
const fakeTimers = require('@sinonjs/fake-timers');
const calendar = require('../../modules/calendar');
const places = require('../../modules/places');
const notifications = require('../../modules/notifications');
const preferences = require('../../modules/preferences');
const lunchBreak = require('../lunch-break');
const logger = require('../../utilities/logger');

jest.mock('../../modules/calendar');
jest.mock('../../modules/places');
jest.mock('../../modules/notifications');
jest.mock('../../modules/preferences');
jest.mock('../../utilities/logger');

const pref = {
  ...preferences.defaults,
  location: {
    latitude: 48.78232,
    longitude: 9.17702,
  },
};
preferences.get.mockResolvedValue(pref);

const scheduleJobSpy = jest.spyOn(schedule, 'scheduleJob');

notifications.sendNotification.mockResolvedValue();

logger.error.mockReturnValue();

const now = new Date('2020-01-15T08:00:00Z');
const clock = fakeTimers.install({ now });

describe('lunch break use case', () => {
  afterAll(() => {
    clock.uninstall();
  });

  afterEach(() => {
    jest.clearAllMocks();
    clock.reset();
    Object.values(schedule.scheduledJobs).forEach((job) => job.cancel());
  });

  describe('init', () => {
    it('should schedule a run', async () => {
      // TODO check execution by ticking the clock?
      lunchBreak.init();
      expect(scheduleJobSpy).toHaveBeenCalledWith(
        {
          minute: 0, hour: 0, dayOfWeek: [1, 2, 3, 4, 5], tz: 'Europe/Berlin',
        },
        lunchBreak.run,
      );
    });
  });

  describe('run', () => {
    it('should not schedule a notification if no free slot is available', async () => {
      calendar.getFreeSlotsBetween.mockResolvedValueOnce([]);

      await lunchBreak.run();

      expect(scheduleJobSpy).not.toHaveBeenCalled();
      expect(notifications.sendNotifications).not.toHaveBeenCalled();
    });

    it('should not schedule a notification if no free slot is long enough', async () => {
      const slot = {
        start: new Date('2020-01-15T11:00:00Z'),
        end: new Date('2020-01-15T11:30:00Z'),
      };
      calendar.getFreeSlotsBetween.mockResolvedValueOnce([slot]);

      await lunchBreak.run();

      expect(scheduleJobSpy).not.toHaveBeenCalled();
      expect(notifications.sendNotifications).not.toHaveBeenCalled();
    });

    it('should schedule a notification for the longest free slot', async () => {
      const shorterSlot = {
        start: new Date('2020-01-15T11:00:00Z'),
        end: new Date('2020-01-15T12:00:00Z'),
      };
      const longerSlot = {
        start: new Date('2020-01-15T12:30:00Z'),
        end: new Date('2020-01-15T14:00:00Z'),
      };
      calendar.getFreeSlotsBetween.mockResolvedValueOnce([shorterSlot, longerSlot]);

      await lunchBreak.run();

      expect(scheduleJobSpy).toHaveBeenCalledTimes(1);
      expect(notifications.sendNotifications).not.toHaveBeenCalled();

      clock.tick(longerSlot.start - now - pref.lunchBreakMinutesBeforeStart * 60 * 1000);

      expect(notifications.sendNotifications).toHaveBeenCalledTimes(1);
      expect(notifications.sendNotifications).toHaveBeenLastCalledWith({
        title: 'Recommended restaurant for your lunch break',
        options: {
          body: 'You have some time to spare during your lunch break at 13:30, why not try a restaurant?',
          icon: '/favicon.jpg',
          badge: '/badge.png',
          data: {
            usecase: 'lunch-break',
          },
        },
      });
    });

    it('should log, but not throw errors', async () => {
      const error = new Error('Sorry!');
      calendar.getFreeSlotsBetween.mockRejectedValueOnce(error);

      await lunchBreak.run();

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenLastCalledWith(error);
    });
  });

  describe('getRandomRestaurantNear', () => {
    it('should return a random restaurant', async () => {
      const restaurant = {
        poi: { name: 'Gaststätte zum Hirsch' },
        dist: 500,
        address: { streetName: 'Halligalli-Straße' },
        position: { lat: 0, lon: 0 },
      };
      places.getPOIsAround.mockResolvedValueOnce([restaurant]);

      await expect(lunchBreak.getRandomRestaurantNear({
        latitude: 0,
        longitude: 0,
        pref,
      })).resolves.toStrictEqual(restaurant);
    });

    it('should return undefined if no restaurant is found', async () => {
      places.getPOIsAround.mockResolvedValueOnce([]);

      await expect(lunchBreak.getRandomRestaurantNear({
        latitude: 0,
        longitude: 0,
        pref,
      })).resolves.toBeUndefined();
    });
  });
});
