const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('/api/preferences', () => {
  describe('GET /', () => {
    it('should work', async () => {
      request.get('/api/preferences');
    });
  });

  describe('PATCH /', () => {
    it('should work', async () => {
      request.patch('/api/preferences');
    });
  });
});
