const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('/api/personal-trainer', () => {
  describe('GET /', () => {
    it('should work', async () => {
      request.get('/api/personal-trainer');
    });
  });

  describe('GET /confirm', () => {
    it('should work', async () => {
      request.get('/api/personal-trainer/confirm');
    });
  });
});
