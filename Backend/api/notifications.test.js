jest.mock('morgan', () => () => (req, res, next) => next());

const supertest = require('supertest');
const app = require('../app');
const notifications = require('../modules/notifications');

jest.mock('../modules/notifications');

const request = supertest(app);

describe('/api/notifications', () => {
  describe('POST /enable', () => {
    it('should store the subscription and send a notification', async () => {
      notifications.addSubscription.mockResolvedValueOnce();
      notifications.sendNotification.mockResolvedValueOnce();

      const subscription = {
        endpoint: 'https://example.com/a',
        expirationTime: null,
        keys: { p256dh: 'p256dh_key_a', auth: 'auth_key_a' },
      };

      const response = await request.post('/api/notifications/enable').send(subscription);

      expect(response.status).toStrictEqual(200);
      expect(notifications.addSubscription).toHaveBeenCalledTimes(1);
      expect(notifications.addSubscription).toHaveBeenLastCalledWith(subscription);
      expect(notifications.sendNotification).toHaveBeenCalledTimes(1);
      expect(notifications.sendNotification).toHaveBeenLastCalledWith(
        {
          title: 'A notification from Gunter!',
          options: {
            body: 'It works :)',
            icon: '/favicon.jpg',
            badge: '/badge.png',
          },
        },
        subscription,
      );
    });
  });

  describe('POST /disable', () => {
    it('remove the subscription', async () => {
      notifications.removeSubscription.mockResolvedValueOnce();

      const response = await request.post('/api/notifications/disable').send({
        endpoint: 'https://example.com/a',
      });

      expect(response.status).toStrictEqual(200);
      expect(notifications.removeSubscription).toHaveBeenCalledTimes(1);
      expect(notifications.removeSubscription).toHaveBeenLastCalledWith('https://example.com/a');
    });
  });
});
