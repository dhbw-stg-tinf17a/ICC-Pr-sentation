const supertest = require('supertest');
const fakeTimers = require('@sinonjs/fake-timers');
const app = require('../app');
const lunchBreak = require('../usecases/lunch-break');

jest.mock('../usecases/lunch-break');

const clock = fakeTimers.install({
  now: new Date('2020-01-15T08:00:00Z'),
});

const request = supertest(app);

describe('/api/lunch-break', () => {
  afterAll(() => {
    clock.uninstall();
  });

  afterEach(() => {
    clock.reset();
  });

  describe('GET /', () => {
    it('should generate a valid message if a free slot and a restaurant is found', async () => {
      lunchBreak.getFreeSlotForLunchbreak.mockResolvedValueOnce({
        start: new Date('2020-01-15T11:00:00Z'),
        end: new Date('2020-01-15T12:00:00Z'),
      });

      lunchBreak.getRandomRestaurantNear.mockResolvedValueOnce({
        poi: { name: 'Gaststätte zum Hirsch' },
        dist: 500,
        address: { freeformAddress: 'Halligalli-Straße 27, 78902 Vorderhahn' },
        location: { lat: 0, lon: 0 },
      });

      const response = await request.get('/api/lunch-break?latitude=0&longitude=0');

      expect(response.status).toEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'Lunch break: 12:00 - 13:00.\n'
          + 'Restaurant: Gaststätte zum Hirsch at Halligalli-Straße 27, 78902 Vorderhahn.\n',
        textToRead: 'You have time for a lunch break from 12:00 to 13:00.\n'
          + 'I recommend the restaurant Gaststätte zum Hirsch.\n',
        furtherAction: 'Do you want to know how to get to the restaurant?',
        nextLink: 'lunch-break/confirm?originLatitude=0&originLongitude=0&destinationLatitude=0&'
          + 'destinationLongitude=0&departure=2020-01-15T11:00:00.000Z',
      });
    });

    it('should generate a valid message if no free slot and no restaurant is found', async () => {
      lunchBreak.getFreeSlotForLunchbreak.mockResolvedValueOnce();

      lunchBreak.getRandomRestaurantNear.mockResolvedValueOnce();

      const response = await request.get('/api/lunch-break?latitude=0&longitude=0');

      expect(response.status).toEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'No time for a lunch break.\nNo restaurant found.\n',
        textToRead: 'Unfortunately, you don\'t have time for a lunch break today, but I\'ll try to '
          + 'find a restaurant anyway.\nUnfortunately I could not find a restaurant for today. '
          + 'Sorry.\n',
      });
    });

    it('should generate a valid message if no free slot, but a restaurant is found', async () => {
      lunchBreak.getFreeSlotForLunchbreak.mockResolvedValueOnce();

      lunchBreak.getRandomRestaurantNear.mockResolvedValueOnce({
        poi: { name: 'Gaststätte zum Hirsch' },
        dist: 500,
        address: { freeformAddress: 'Halligalli-Straße 27, 78902 Vorderhahn' },
        location: { lat: 0, lon: 0 },
      });

      const response = await request.get('/api/lunch-break?latitude=0&longitude=0');

      expect(response.status).toEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'No time for a lunch break.\n'
          + 'Restaurant: Gaststätte zum Hirsch at Halligalli-Straße 27, 78902 Vorderhahn.\n',
        textToRead: 'Unfortunately, you don\'t have time for a lunch break today, but I\'ll try to '
          + 'find a restaurant anyway.\nI recommend the restaurant Gaststätte zum Hirsch.\n',
        furtherAction: 'Do you want to know how to get to the restaurant?',
        nextLink: 'lunch-break/confirm?originLatitude=0&originLongitude=0&destinationLatitude=0&'
          + 'destinationLongitude=0&departure=2020-01-15T08:00:00.000Z',
      });
    });
  });

  describe('GET /confirm', () => {
    it('should work', async () => {
      // const response = await request.get('/api/lunch-break/confirm');
    });
  });
});
