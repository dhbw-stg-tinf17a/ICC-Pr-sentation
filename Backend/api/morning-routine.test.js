const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('/api/morning-routine', () => {
  describe('GET /', () => {
    it('should work', async () => {
      await request.get('/api/morning-routine');
    });
  });

  describe('GET /confirm', () => {
    it('should work', async () => {
      await request.get('/api/morning-routine/ocnfirm');
    });
  });
});
