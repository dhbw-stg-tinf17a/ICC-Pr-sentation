const schedule = require('node-schedule');
const fakeTimers = require('@sinonjs/fake-timers');
const morningRoutine = require('../morning-routine');
const notifications = require('../../modules/notifications');
const quote = require('../../modules/quote');
const preferences = require('../../modules/preferences');
const calendar = require('../../modules/calendar');
const logger = require('../../utilities/logger');
const vvs = require('../../modules/vvs');
const weather = require('../../modules/weather');

jest.mock('../../modules/notifications');
jest.mock('../../modules/quote');
jest.mock('../../modules/preferences');
jest.mock('../../modules/calendar');
jest.mock('../../utilities/logger');
jest.mock('../../modules/vvs');
jest.mock('../../modules/weather');

const now = new Date('2020-01-15T08:00:00Z');
const clock = fakeTimers.install({ now });

const scheduleJobSpy = jest.spyOn(schedule, 'scheduleJob');

const pref = preferences.defaults;
preferences.get.mockResolvedValue({
  ...pref,
  location: {
    latitude: 48.78232,
    longitude: 9.17702,
  },
});

notifications.sendNotification.mockResolvedValue();

logger.error.mockReturnValue();

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
    it('should schedule a run', async () => {
      // TODO check execution by ticking the clock?
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
    it('should schedule a notification if there is an upcoming event today', async () => {
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

    it('should schedule a notification if there is an upcoming event tomorrow', async () => {
      const event = {
        start: new Date('2020-01-16T07:00:00Z'),
        end: new Date('2020-01-16T12:00:00Z'),
        summary: 'Tomorrow never dies',
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
          body: 'Tomorrow never dies starts at 08:00.',
          icon: '/favicon.jpg',
          badge: '/badge.png',
          data: {
            usecase: 'morning-routine',
          },
        },
      });
    });

    it('should not schedule a notification if there is no upcoming event today or tomorrow', async () => {
      const event = {
        start: new Date('2020-01-15T04:00:00Z'),
        end: new Date('2020-01-15T06:00:00Z'),
      };
      calendar.getEventsStartingBetween.mockResolvedValueOnce([event]);

      await morningRoutine.run();

      expect(scheduleJobSpy).not.toHaveBeenCalled();
    });

    it('should log, but not throw an error if no home location is set', async () => {
      preferences.get.mockResolvedValueOnce(preferences.defaults);

      await morningRoutine.run();

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenLastCalledWith(new Error('Home location is not set'));
    });

    it('should schedule a notification according to the connection to the upcoming event', async () => {
      const event = {
        start: new Date('2020-01-15T10:00:00Z'),
        end: new Date('2020-01-15T15:00:00Z'),
        summary: 'What a beautiful morning',
        location: 'Schlumpfhausen',
      };
      calendar.getEventsStartingBetween.mockResolvedValueOnce([event]);

      const connection = {
        departure: '2020-01-15T10:00:00Z',
        arrival: '2020-01-15T11:00:00Z',
        duration: {
          hours: 1,
          minutes: 0,
        },
        legs: [
          {
            mode: 'transport',
            from: 'Talstraße',
            to: 'Bergstraße',
            departure: '2020-01-15T10:00:00Z',
            arrival: '2020-01-15T11:00:00Z',
            lineName: 'Zahnradbahn',
            lineDestination: 'Gipfelstraße',
          },
        ],
      };
      vvs.getConnection.mockResolvedValueOnce(connection);

      await morningRoutine.run();

      expect(scheduleJobSpy).toHaveBeenCalled();
      expect(notifications.sendNotifications).not.toHaveBeenCalled();

      const msForPreparation = pref.morningRoutineMinutesForPreparation * 60 * 1000;
      clock.tick(new Date(connection.departure) - now - msForPreparation);

      expect(notifications.sendNotifications).toHaveBeenCalledTimes(1);
      expect(notifications.sendNotifications).toHaveBeenLastCalledWith({
        title: 'Wake up!',
        options: {
          body: 'What a beautiful morning starts at 11:00. You have to leave at 11:00.',
          icon: '/favicon.jpg',
          badge: '/badge.png',
          data: {
            usecase: 'morning-routine',
          },
        },
      });
    });

    it('should schedule a notification according to the start of the upcoming event if no connection is found', async () => {
      const event = {
        start: new Date('2020-01-15T11:00:00Z'),
        end: new Date('2020-01-15T12:00:00Z'),
        summary: 'The final countdown',
        location: 'Europe',
      };
      calendar.getEventsStartingBetween.mockResolvedValueOnce([event]);

      vvs.getConnection.mockResolvedValueOnce();

      await morningRoutine.run();

      expect(scheduleJobSpy).toHaveBeenCalled();
      expect(notifications.sendNotifications).not.toHaveBeenCalled();

      clock.tick(event.start - now - pref.morningRoutineMinutesForPreparation * 60 * 1000);

      expect(notifications.sendNotifications).toHaveBeenCalledTimes(1);
      expect(notifications.sendNotifications).toHaveBeenLastCalledWith({
        title: 'Wake up!',
        options: {
          body: 'The final countdown starts at 12:00.',
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

  describe('getWeatherForecast', () => {
    it('should return the weather forecast', async () => {
      const weatherForecast = [
        {
          day: { shortPhrase: 'only rain' },
          temperature: { maximum: { value: 16 } },
        },
        {
          day: { shortPhrase: 'only sunshine' },
          temperature: { maximum: { value: 20 } },
        },
      ];
      weather.getForecast.mockResolvedValueOnce(weatherForecast);

      await expect(morningRoutine.getWeatherForecast({
        pref,
        datetime: new Date('2020-01-16T11:00:00Z'),
      })).resolves.toStrictEqual(weatherForecast[1]);
    });
  });
});
