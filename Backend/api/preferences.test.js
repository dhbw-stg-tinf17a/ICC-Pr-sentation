jest.mock('morgan', () => () => (req, res, next) => next());

const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('/api/preferences', () => {
  describe('GET /', () => {
    it('should work', async () => {
      // const response = request.get('/api/preferences');
    });
  });

  describe('PATCH /', () => {
    it('should work', async () => {
      // const response = request.patch('/api/preferences');
    });
  });
});
