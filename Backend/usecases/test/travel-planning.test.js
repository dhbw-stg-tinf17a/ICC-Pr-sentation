const schedule = require('node-schedule');
const fakeTimers = require('@sinonjs/fake-timers');
const travelPlanning = require('../travel-planning');
const preferences = require('../../modules/preferences');
const notifications = require('../../modules/notifications');
const logger = require('../../utilities/logger');
const calendar = require('../../modules/calendar');
const db = require('../../modules/db');
const weather = require('../../modules/weather');
const vvs = require('../../modules/vvs');

jest.mock('../../modules/preferences');
jest.mock('../../modules/notifications');
jest.mock('../../utilities/logger');
jest.mock('../../modules/calendar');
jest.mock('../../modules/db');
jest.mock('../../modules/weather');
jest.mock('../../modules/vvs');

const pref = {
  ...preferences.defaults,
  location: {
    latitude: 48.78232,
    longitude: 9.17702,
  },
};
preferences.getChecked.mockResolvedValue(pref);

const scheduleJobSpy = jest.spyOn(schedule, 'scheduleJob');

notifications.sendNotification.mockResolvedValue();

logger.error.mockReturnValue();

const frankfurt = {
  id: '8000105',
  name: 'Frankfurt (Main) Hbf',
  address: { city: 'Frankfurt (Main)' },
  location: { latitude: 50.110924, longitude: 8.682127 },
};
db.getFilteredStations.mockImplementation(
  (predicate) => Promise.resolve([frankfurt].filter(predicate)),
);

db.getConnections.mockResolvedValue([
  {
    departure: new Date('2020-01-18T10:00:00Z'),
    arrival: new Date('2020-01-18T12:00:00Z'),
    duration: { hours: 2, minutes: 0 },
    price: 50.8,
  },
  {
    departure: new Date('2020-01-18T09:00:00Z'),
    arrival: new Date('2020-01-18T12:00:00Z'),
    duration: { hours: 3, minutes: 0 },
    price: 19.9,
  },
]);

const now = new Date('2020-01-15T08:00:00Z');
const clock = fakeTimers.install({ now });

describe('travel planning use case', () => {
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
      travelPlanning.init();
      expect(scheduleJobSpy).toHaveBeenCalledWith(
        {
          minute: 0, hour: 7, dayOfWeek: 5, tz: 'Europe/Berlin',
        },
        travelPlanning.run,
      );
    });
  });

  describe('run', () => {
    it('should not schedule a notification if the weekend is not free', async () => {
      const event = {
        start: new Date('2020-01-18T10:00:00Z'),
        end: new Date('2020-01-18T15:00:00Z'),
        summary: 'Busy saturday',
      };
      calendar.getEventsStartingBetween.mockResolvedValueOnce([event]);

      await travelPlanning.run();

      expect(scheduleJobSpy).not.toHaveBeenCalled();
    });

    it('should schedule a notification for the cheapest connections if the weekend is free', async () => {
      calendar.getEventsStartingBetween.mockResolvedValueOnce([]);

      await travelPlanning.run();

      expect(notifications.sendNotifications).toHaveBeenCalledTimes(1);
      expect(notifications.sendNotifications).toHaveBeenLastCalledWith({
        options: {
          badge: '/badge.png',
          body: 'Your weekend seems to be free, why not travel to Frankfurt (Main) and back for just 39.8 €?',
          data: {
            destinationID: '8000105',
            usecase: 'travel-planning',
          },
          icon: '/favicon.jpg',
        },
        title: 'Recommended trip for this weekend',
      });
    });

    it('should log, but not throw errors', async () => {
      const error = new Error('Sorry!');
      calendar.getEventsStartingBetween.mockRejectedValueOnce(error);

      await travelPlanning.run();

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenLastCalledWith(error);
    });
  });

  describe('getWeatherForecast', () => {
    it('should return the weather forecast', async () => {
      const weatherForecast = [
        {
          day: { shortPhrase: 'nice wednesday' },
          temperature: { maximum: { value: 16 } },
        },
        {
          day: { shortPhrase: 'mediocre thursday' },
          temperature: { maximum: { value: 20 } },
        },
        {
          day: { shortPhrase: 'flamboyant friday' },
          temperature: { maximum: { value: 22 } },
        },
        {
          day: { shortPhrase: 'sassy saturday' },
          temperature: { maximum: { value: 23 } },
        },
        {
          day: { shortPhrase: 'sunny sunday' },
          temperature: { maximum: { value: 25 } },
        },
      ];
      weather.getForecast.mockResolvedValueOnce(weatherForecast);

      const saturday = new Date('2020-01-18T12:00:00Z');
      const sunday = new Date('2020-01-19T12:00:00Z');

      await expect(travelPlanning.getWeatherForecast({
        destination: frankfurt,
        saturday,
        sunday,
      })).resolves.toStrictEqual({
        saturdayWeatherForecast: weatherForecast[3],
        sundayWeatherForecast: weatherForecast[4],
      });
    });
  });

  describe('getConnectionToMainStation', () => {
    it('should return a connection to the main station', async () => {
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

      await expect(travelPlanning.getConnectionToMainStation('2020-01-18T08:00:00Z'))
        .resolves.toStrictEqual(connection);
    });
  });
});
