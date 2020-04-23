const schedule = require('node-schedule');
const fakeTimers = require('@sinonjs/fake-timers');
const personalTrainer = require('../personal-trainer');
const preferences = require('../../modules/preferences');
const notifications = require('../../modules/notifications');
const logger = require('../../utilities/logger');
const calendar = require('../../modules/calendar');
const weather = require('../../modules/weather');
const places = require('../../modules/places');

jest.mock('../../modules/preferences');
jest.mock('../../modules/notifications');
jest.mock('../../utilities/logger');
jest.mock('../../modules/calendar');
jest.mock('../../modules/weather');
jest.mock('../../modules/places');

const pref = preferences.defaults;
preferences.get.mockResolvedValue({
  ...pref,
  location: {
    latitude: 48.78232,
    longitude: 9.17702,
  },
});

const scheduleJobSpy = jest.spyOn(schedule, 'scheduleJob');

notifications.sendNotification.mockResolvedValue();

logger.error.mockReturnValue();

const now = new Date('2020-01-15T08:00:00Z');
const clock = fakeTimers.install({ now });

describe('personal trainer use case', () => {
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
      personalTrainer.init();
      expect(scheduleJobSpy).toHaveBeenCalledWith(
        {
          minute: 0, hour: 0, tz: 'Europe/Berlin',
        },
        personalTrainer.run,
      );
    });
  });

  describe('run', () => {
    it('should not schedule a notification if no free slot is available', async () => {
      calendar.getFreeSlotsBetween.mockResolvedValueOnce([]);

      await personalTrainer.run();

      expect(scheduleJobSpy).not.toHaveBeenCalled();
      expect(notifications.sendNotifications).not.toHaveBeenCalled();
    });

    it('should not schedule a notification if no free slot is long enough', async () => {
      const slot = {
        start: new Date('2020-01-15T16:00:00Z'),
        end: new Date('2020-01-15T16:30:00Z'),
      };
      calendar.getFreeSlotsBetween.mockResolvedValueOnce([slot]);

      await personalTrainer.run();

      expect(scheduleJobSpy).not.toHaveBeenCalled();
      expect(notifications.sendNotifications).not.toHaveBeenCalled();
    });

    it('should schedule a notification for the longest free slot on a rainy day', async () => {
      const shorterSlot = {
        start: new Date('2020-01-15T16:00:00Z'),
        end: new Date('2020-01-15T17:00:00Z'),
      };
      const longerSlot = {
        start: new Date('2020-01-15T18:00:00Z'),
        end: new Date('2020-01-15T20:00:00Z'),
      };
      calendar.getFreeSlotsBetween.mockResolvedValueOnce([shorterSlot, longerSlot]);

      weather.getForecast.mockResolvedValueOnce([
        {
          day: {
            shortPhrase: 'only rain',
            hasPrecipitation: true,
          },
          temperature: { maximum: { value: 16 } },
        },
      ]);

      const restaurant = {
        poi: { name: 'Sport ist Mord' },
        dist: 500,
        address: { streetName: 'An der Laufbahn' },
        position: { lat: 0, lon: 0 },
      };
      places.getPOIsAround.mockResolvedValueOnce([restaurant]);

      await personalTrainer.run();

      expect(scheduleJobSpy).toHaveBeenCalledTimes(1);
      expect(notifications.sendNotifications).not.toHaveBeenCalled();

      clock.tick(longerSlot.start - now - pref.personalTrainerMinutesBeforeStart * 60 * 1000);

      expect(notifications.sendNotifications).toHaveBeenCalledTimes(1);
      expect(notifications.sendNotifications).toHaveBeenLastCalledWith({
        title: 'Recommended sports activity',
        options: {
          body: 'You have got a little time at 19:00. Since it rains today, why don\'t you do some sports at Sport ist Mord?',
          icon: '/favicon.jpg',
          badge: '/badge.png',
          data: {
            usecase: 'personal-trainer',
          },
        },
      });
    });

    it('should schedule a notification for the longest free slot on a sunny day', async () => {
      const shorterSlot = {
        start: new Date('2020-01-15T16:00:00Z'),
        end: new Date('2020-01-15T17:00:00Z'),
      };
      const longerSlot = {
        start: new Date('2020-01-15T18:00:00Z'),
        end: new Date('2020-01-15T20:00:00Z'),
      };
      calendar.getFreeSlotsBetween.mockResolvedValueOnce([shorterSlot, longerSlot]);

      weather.getForecast.mockResolvedValueOnce([
        {
          day: {
            shortPhrase: 'only sun',
            hasPrecipitation: false,
          },
          temperature: { maximum: { value: 20 } },
        },
      ]);

      const restaurant = {
        poi: { name: 'Schöneberg-Park' },
        dist: 500,
        address: { streetName: 'Am Schöneberg-See' },
        position: { lat: 0, lon: 0 },
      };
      places.getPOIsAround.mockResolvedValueOnce([restaurant]);

      await personalTrainer.run();

      expect(scheduleJobSpy).toHaveBeenCalledTimes(1);
      expect(notifications.sendNotifications).not.toHaveBeenCalled();

      clock.tick(longerSlot.start - now - pref.personalTrainerMinutesBeforeStart * 60 * 1000);

      expect(notifications.sendNotifications).toHaveBeenCalledTimes(1);
      expect(notifications.sendNotifications).toHaveBeenLastCalledWith({
        title: 'Recommended sports activity',
        options: {
          body: 'You have got a little time at 19:00. Since it doesn\'t rain today, why don\'t you do some sports at Schöneberg-Park?',
          icon: '/favicon.jpg',
          badge: '/badge.png',
          data: {
            usecase: 'personal-trainer',
          },
        },
      });
    });

    it('should log, but not throw an error if no home location is set', async () => {
      preferences.get.mockResolvedValueOnce(preferences.defaults);

      const slot = {
        start: new Date('2020-01-15T16:00:00Z'),
        end: new Date('2020-01-15T17:00:00Z'),
      };
      calendar.getFreeSlotsBetween.mockResolvedValueOnce([slot]);

      await personalTrainer.run();

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenLastCalledWith(new Error('Home location is not set'));
    });

    it('should not schedule a notification if no POI is found', async () => {
      const slot = {
        start: new Date('2020-01-15T16:00:00Z'),
        end: new Date('2020-01-15T17:00:00Z'),
      };
      calendar.getFreeSlotsBetween.mockResolvedValueOnce([slot]);

      weather.getForecast.mockResolvedValueOnce([
        {
          day: {
            shortPhrase: 'only sun',
            hasPrecipitation: false,
          },
          temperature: { maximum: { value: 20 } },
        },
      ]);

      places.getPOIsAround.mockResolvedValueOnce([]);

      await personalTrainer.run();

      expect(scheduleJobSpy).not.toHaveBeenCalled();
    });
  });
});
