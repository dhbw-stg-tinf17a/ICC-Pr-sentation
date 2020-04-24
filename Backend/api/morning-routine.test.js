jest.mock('morgan', () => () => (req, res, next) => next());

const supertest = require('supertest');
const fakeTimers = require('@sinonjs/fake-timers');
const app = require('../app');
const morningRoutine = require('../usecases/morning-routine');

jest.mock('../usecases/morning-routine');

morningRoutine.getWeatherForecast.mockResolvedValue({
  day: {
    shortPhrase: 'Breezy in the morning; sunny',
    longPhrase: 'Breezy this morning; otherwise, chilly with plenty of sunshine',
  },
});

const clock = fakeTimers.install({
  now: new Date('2020-01-15T08:00:00Z'),
});

const request = supertest(app);

describe('/api/morning-routine', () => {
  afterAll(() => {
    clock.uninstall();
  });

  afterEach(() => {
    clock.reset();
  });

  describe('GET /', () => {
    it('should generate a valid message if an event and a connection is found', async () => {
      morningRoutine.getWakeUpTime.mockResolvedValueOnce({
        event: {
          summary: 'Mediocre morning',
          start: new Date('2020-01-16T08:00:00Z'),
        },
        connection: {
          departure: '2020-01-16T07:20:00Z',
          legs: [
            { to: 'Talstraße' },
            { to: 'Bergstraße' },
          ],
        },
        wakeUpTime: new Date('2020-01-16T07:00:00Z'),
      });

      const response = await request.get('/api/morning-routine');

      expect(response.status).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'Event: Mediocre morning.\nStart: Tomorrow 09:00 AM.\nLeave at: 08:20 AM.\n'
          + 'Go to Talstraße, then Bergstraße.\nWake up at: 08:00 AM.\n'
          + 'Weather: Breezy in the morning; sunny.',
        textToRead: 'Your next event is Mediocre morning.\nIt starts at Tomorrow 09:00 AM.\n'
          + 'You have to leave at 08:20 AM.\nGo to Talstraße, then Bergstraße.\n'
          + 'Wake up at 08:00 AM.\n'
          + 'The weather will be Breezy this morning; otherwise, chilly with plenty of sunshine.',
        furtherAction: 'Do you want to hear your quote of the day?',
        nextLink: 'morning-routine/confirm',
      });
    });

    it('should generate a valid message if an event, but no connection is found', async () => {
      morningRoutine.getWakeUpTime.mockResolvedValueOnce({
        event: {
          summary: 'Mediocre morning',
          start: new Date('2020-01-16T08:00:00Z'),
        },
        wakeUpTime: new Date('2020-01-16T07:40:00Z'),
      });

      const response = await request.get('/api/morning-routine');

      expect(response.status).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'Event: Mediocre morning.\nStart: Tomorrow 09:00 AM.\n'
          + 'Wake up at: 08:40 AM.\nWeather: Breezy in the morning; sunny.',
        textToRead: 'Your next event is Mediocre morning.\nIt starts at Tomorrow 09:00 AM.\n'
          + 'Wake up at 08:40 AM.\n'
          + 'The weather will be Breezy this morning; otherwise, chilly with plenty of sunshine.',
        furtherAction: 'Do you want to hear your quote of the day?',
        nextLink: 'morning-routine/confirm',
      });
    });

    it('should generate a valid message if no event is found', async () => {
      morningRoutine.getWakeUpTime.mockResolvedValueOnce({});

      const response = await request.get('/api/morning-routine');

      expect(response.status).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'No event.\nWeather: Breezy in the morning; sunny.',
        textToRead: 'I did not find a relevant event.\n'
          + 'The weather will be Breezy this morning; otherwise, chilly with plenty of sunshine.',
        furtherAction: 'Do you want to hear your quote of the day?',
        nextLink: 'morning-routine/confirm',
      });
    });
  });

  describe('GET /confirm', () => {
    it('should generate a valid message with the quote of the day', async () => {
      morningRoutine.getQuoteOfTheDay.mockResolvedValueOnce({
        quote: 'Only a stupid man would request that many quotes.',
        author: 'Gunter',
      });

      const response = await request.get('/api/morning-routine/confirm');

      expect(response.status).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'Quote of the day: "Only a stupid man would request that many quotes." - '
          + 'Gunter.',
        textToRead: 'Your quote of the day is from Gunter. He said Only a stupid man would request '
          + 'that many quotes.',
      });
    });
  });
});
