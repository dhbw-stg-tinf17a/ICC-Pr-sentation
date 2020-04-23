const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('/api/notifications', () => {
  describe('POST /enable', () => {
    it('should work', async () => {
      request.post('/api/notifications/enable');
    });
  });

  describe('POST /disable', () => {
    it('should work', async () => {
      request.post('/api/notifications/disable');
    });
  });
});
