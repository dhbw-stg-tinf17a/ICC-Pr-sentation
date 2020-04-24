jest.mock('morgan', () => () => (req, res, next) => next());

const supertest = require('supertest');
const fakeTimers = require('@sinonjs/fake-timers');
const app = require('../app');
const travelPlanning = require('../usecases/travel-planning');

jest.mock('../usecases/travel-planning');

const clock = fakeTimers.install({
  now: new Date('2020-01-15T08:00:00Z'),
});

const request = supertest(app);

describe('/api/travel-planning', () => {
  afterAll(() => {
    clock.uninstall();
  });

  afterEach(() => {
    clock.reset();
  });

  describe('GET /', () => {
    it('should generate a valid message with a free weekend and a destination', async () => {
      travelPlanning.getWeekend.mockResolvedValueOnce({
        saturday: new Date('2020-01-18T12:00:00Z'),
        sunday: new Date('2020-01-19T12:00:00Z'),
        weekendFree: true,
      });

      travelPlanning.planRandomTrip.mockResolvedValueOnce({
        destination: {
          name: 'Frankurt (Main) Hbf',
        },
        connectionToDestination: {
          departure: new Date('2020-01-18T08:00:00Z'),
          arrival: new Date('2020-01-18T10:00:00Z'),
          price: 20.9,
        },
        connectionFromDestination: {
          departure: new Date('2020-01-19T18:00:00Z'),
          arrival: new Date('2020-01-19T20:00:00Z'),
          price: 31.6,
        },
      });

      travelPlanning.getWeatherForecast.mockResolvedValueOnce({
        saturdayWeatherForecast: {
          day: {
            shortPhrase: 'Breezy in the morning; sunny',
            longPhrase: 'Breezy this morning; otherwise, chilly with plenty of sunshine',
          },
        },
        sundayWeatherForecast: {
          day: {
            shortPhrase: 'Breezy all day',
            longPhrase: 'Breezy all day with some clouds',
          },
        },
      });

      const response = await request.get('/api/travel-planning');

      expect(response.status).toStrictEqual(200);
      expect(response.body).toStrictEqual({

        textToDisplay: 'Free next weekend.\nDestination: Frankurt (Main) Hbf.\n'
          + 'To destination: Saturday 09:00 AM - 11:00 AM.\n'
          + 'From destination: Sunday 07:00 PM - 09:00 PM.\nTotal price: 52.5 €.\n'
          + 'Saturday weather: Breezy in the morning; sunny.\nSunday weather: Breezy all day.',
        textToRead: 'You are free next weekend.\nYou could travel to Frankurt (Main) Hbf.\n'
          + 'You start from the main station Saturday 09:00 AM and arrive at 11:00 AM.\n'
          + 'The journey back starts Sunday 07:00 PM and ends at 09:00 PM.\n'
          + 'The total price will be 52.5 Euros.\nThe weather on Saturday will be Breezy this '
          + 'morning; otherwise, chilly with plenty of sunshine.\nOn Sunday it will be Breezy all '
          + 'day with some clouds.',
        furtherAction: 'Do you want to know how to get to the main station?',
        nextLink: 'travel-planning/confirm?arrival=2020-01-18T08:00:00.000Z',
      });
    });
  });

  describe('GET /confirm', () => {
    it('should work', async () => {
      /* const response = await request.get('/api/travel-planning/confirm');

      expect(response.status).toStrictEqual(200);
      expect(response.body).toStrictEqual({}); */
    });
  });
});
