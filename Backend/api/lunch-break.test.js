jest.mock('morgan', () => () => (req, res, next) => next());

const supertest = require('supertest');
const fakeTimers = require('@sinonjs/fake-timers');
const app = require('../app');
const lunchBreak = require('../usecases/lunch-break');
const vvs = require('../modules/vvs');

jest.mock('../usecases/lunch-break');
jest.mock('../modules/vvs');

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

      const response = await request.get('/api/lunch-break').query({
        latitude: 0,
        longitude: 0,
      });

      expect(response.status).toEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'Lunch break: 12:00 PM - 01:00 PM.\n'
          + 'Restaurant: Gaststätte zum Hirsch at Halligalli-Straße 27, 78902 Vorderhahn.',
        textToRead: 'You have time for a lunch break from 12:00 PM to 01:00 PM.\n'
          + 'I recommend the restaurant Gaststätte zum Hirsch.',
        furtherAction: 'Do you want to know how to get to the restaurant?',
        nextLink: 'lunch-break/confirm?originLatitude=0&originLongitude=0&destinationLatitude=0&'
          + 'destinationLongitude=0&departure=2020-01-15T11:00:00.000Z',
      });
    });

    it('should generate a valid message if no free slot and no restaurant is found', async () => {
      lunchBreak.getFreeSlotForLunchbreak.mockResolvedValueOnce();

      lunchBreak.getRandomRestaurantNear.mockResolvedValueOnce();

      const response = await request.get('/api/lunch-break').query({
        latitude: 0,
        longitude: 0,
      });

      expect(response.status).toEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'No time for a lunch break.\nNo restaurant found.',
        textToRead: 'Unfortunately, you do not have time for a lunch break today, but I will try '
          + 'to find a restaurant anyway.\nUnfortunately I cannot find a restaurant for today. '
          + 'Sorry.',
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

      const response = await request.get('/api/lunch-break').query({
        latitude: 0,
        longitude: 0,
      });

      expect(response.status).toEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'No time for a lunch break.\n'
          + 'Restaurant: Gaststätte zum Hirsch at Halligalli-Straße 27, 78902 Vorderhahn.',
        textToRead: 'Unfortunately, you do not have time for a lunch break today, but I will try '
          + 'to find a restaurant anyway.\nI recommend the restaurant Gaststätte zum Hirsch.',
        furtherAction: 'Do you want to know how to get to the restaurant?',
        nextLink: 'lunch-break/confirm?originLatitude=0&originLongitude=0&destinationLatitude=0&'
          + 'destinationLongitude=0&departure=2020-01-15T08:00:00.000Z',
      });
    });
  });

  describe('GET /confirm', () => {
    it('should generate a valid message if a connection is found', async () => {
      const connection = {
        departure: '2020-01-15T09:50:00Z',
        arrival: '2020-01-15T11:00:00Z',
        duration: {
          hours: 1,
          minutes: 10,
        },
        legs: [
          {
            mode: 'walking',
            from: 'Hier',
            to: 'Talstraße',
            departure: '2020-01-15T09:50:00Z',
            arrival: '2020-01-15T10:00:00Z',
          },
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

      const response = await request.get('/api/lunch-break/confirm').query({
        originLatitude: 0,
        originLongitude: 0,
        destinationLatitude: 0,
        destinationLongitude: 0,
        departure: '2020-01-15T09:50:00Z',
      });

      expect(response.status).toEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'Leave at: 10:50 AM.\nGo to Talstraße, then Bergstraße.',
        textToRead: 'You have to leave at 10:50 AM.\nGo to Talstraße, then Bergstraße.',
      });
    });

    it('should generate a valid message if no connection is found', async () => {
      vvs.getConnection.mockResolvedValueOnce();

      const response = await request.get('/api/lunch-break/confirm').query({
        originLatitude: 0,
        originLongitude: 0,
        destinationLatitude: 0,
        destinationLongitude: 0,
        departure: '2020-01-15T09:50:00Z',
      });

      expect(response.status).toEqual(200);
      expect(response.body).toStrictEqual({
        textToDisplay: 'No route found.',
        textToRead: 'I cannot find a route to the restaurant. Sorry!',
      });
    });
  });
});
