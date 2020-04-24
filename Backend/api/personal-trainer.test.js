jest.mock('morgan', () => () => (req, res, next) => next());

const supertest = require('supertest');
const fakeTimers = require('@sinonjs/fake-timers');
const app = require('../app');
const personalTrainer = require('../usecases/personal-trainer');

jest.mock('../usecases/personal-trainer');

const clock = fakeTimers.install({
  now: new Date('2020-01-15T08:00:00Z'),
});

const request = supertest(app);

describe('/api/personal-trainer', () => {
  afterAll(() => {
    clock.uninstall();
  });

  afterEach(() => {
    clock.reset();
  });

  describe('GET /', () => {
    it(
      'should generate a valid message with a free slot, sunny weather, and a training place',
      async () => {
        personalTrainer.getFreeSlotForActivity.mockResolvedValueOnce({
          start: new Date('2020-01-15T16:00:00Z'),
          end: new Date('2020-01-15T18:00:00Z'),
        });

        personalTrainer.getWeatherForecast.mockResolvedValueOnce({
          day: { hasPrecipitation: false },
        });

        personalTrainer.getRandomParkRecreationArea.mockResolvedValueOnce({
          poi: { name: 'Schöneberg-Park' },
          address: { freeformAddress: 'Am Schöneberg-See 1, 91439 Lindenberg' },
          position: { lat: 0, lon: 0 },
        });

        const response = await request.get('/api/personal-trainer');

        expect(response.status).toStrictEqual(200);
        expect(response.body).toStrictEqual({
          textToDisplay: 'Training slot: 05:00 PM - 07:00 PM.\nIt is sunny, train outdoors.\n'
            + 'Training place: Schöneberg-Park at Am Schöneberg-See 1, 91439 Lindenberg.',
          textToRead: 'You have time for training from 05:00 PM to 07:00 PM.\n'
            + 'Since it is sunny today, I recommend training outdoors.\n'
            + 'I recommend the training place Schöneberg-Park.',
          furtherAction: 'Do you want to know how to get there?',
          nextLink: 'personal-trainer/confirm?latitude=0&longitude=0'
            + '&departure=2020-01-15T16:00:00.000Z',
        });
      },
    );

    it(
      'should generate a valid message with no free slot, rainy weather, and no training place',
      async () => {
        personalTrainer.getFreeSlotForActivity.mockResolvedValueOnce();

        personalTrainer.getWeatherForecast.mockResolvedValueOnce({
          day: { hasPrecipitation: true },
        });

        personalTrainer.getRandomSportsCenter.mockResolvedValueOnce();

        const response = await request.get('/api/personal-trainer');

        expect(response.status).toStrictEqual(200);
        expect(response.body).toStrictEqual({
          textToDisplay: 'No time for training.\nIt rains today, train indoors.\n'
            + 'No training place found.',
          textToRead: 'Unfortunately, you do not have time for training today, but I will try to '
            + 'find a training place anyway.\nSince it rains today, I recommend training indoors.\n'
            + 'Unfortunately I did not find a training place. Train at home.',
        });
      },
    );
  });

  describe('GET /confirm', () => {
    it('should work', async () => {
      const response = await request.get('/api/personal-trainer/confirm');

      expect(response.status).toStrictEqual(200);
    });
  });
});
