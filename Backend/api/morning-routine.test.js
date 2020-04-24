jest.mock('morgan', () => () => (req, res, next) => next());

const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('/api/morning-routine', () => {
  describe('GET /', () => {
    it('should work', async () => {
      // const response = await request.get('/api/morning-routine');
    });
  });

  describe('GET /confirm', () => {
    it('should work', async () => {
      // const response = await request.get('/api/morning-routine/confirm');
    });
  });
});
