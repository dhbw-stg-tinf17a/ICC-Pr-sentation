const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('/api/lunch-break', () => {
  describe('GET /', () => {
    it('should work', async () => {
      await request.get('/api/lunch-break');
    });
  });

  describe('GET /confirm', () => {
    it('should work', async () => {
      await request.get('/api/lunch-break/confirm');
    });
  });
});
