const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('/api/travel-planning', () => {
  describe('GET /', () => {
    it('should work', async () => {
      request.get('/api/travel-planning');
    });
  });

  describe('GET /confirm', () => {
    it('should work', async () => {
      request.get('/api/travel-planning/confirm');
    });
  });
});
