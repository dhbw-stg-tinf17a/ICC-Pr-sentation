jest.mock('morgan', () => () => (req, res, next) => next());

const supertest = require('supertest');
const app = require('../app');
const preferences = require('../modules/preferences');

jest.mock('../modules/preferences');

const request = supertest(app);

describe('/api/preferences', () => {
  describe('GET /', () => {
    it('should work', async () => {
      const pref = { calendarURL: 'https://example.com/a' };
      preferences.get.mockResolvedValueOnce(pref);

      const response = await request.get('/api/preferences');

      expect(response.status).toStrictEqual(200);
      expect(response.body).toStrictEqual(pref);
    });
  });

  describe('PATCH /', () => {
    it('should work', async () => {
      preferences.update.mockResolvedValueOnce();

      const pref = { calendarURL: 'https://example.com/a' };
      const response = await request.patch('/api/preferences').send(pref);

      expect(response.status).toStrictEqual(200);
      expect(preferences.update).toHaveBeenCalledTimes(1);
      expect(preferences.update).toHaveBeenLastCalledWith(pref);
    });
  });
});
