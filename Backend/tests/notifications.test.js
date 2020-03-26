/* eslint-disable global-require */

let mockDatabase;
jest.mock('../utilities/init-database', () => async (name, defaults) => {
  const low = require('lowdb');
  const Memory = require('lowdb/adapters/Memory');
  const adapter = new Memory();
  mockDatabase = low(adapter);
  mockDatabase.defaults(defaults).write();
  return mockDatabase;
});

const webpush = require('web-push');
const notifications = require('../modules/notifications');

jest.mock('web-push');
webpush.sendNotification.mockImplementation();

const subscriptions = [
  {
    endpoint: 'https://example.com/a',
    expirationTime: null,
    keys: { p256dh: 'p256dh_key_a', auth: 'auth_key_a' },
  },
  {
    endpoint: 'https://example.com/b',
    expirationTime: null,
    keys: { p256dh: 'p256dh_key_b', auth: 'auth_key_b' },
  },
];

process.env.PUSH_KEY_PRIVATE = 'PUSH_KEY_PRIVATE';
process.env.PUSH_KEY_PUBLIC = 'PUSH_KEY_PUBLIC';
process.env.PUSH_SUBJECT = 'PUSH_SUBJECT';

describe('notifications module', () => {
  beforeEach(async () => {
    await mockDatabase.setState({ subscriptions: [] });
  });

  describe('addSubscription', () => {
    it('should store every subscription only once', async () => {
      await notifications.addSubscription(subscriptions[0]);
      await notifications.addSubscription(subscriptions[0]);
      await notifications.addSubscription(subscriptions[1]);
      expect(mockDatabase.get('subscriptions').value()).toStrictEqual(subscriptions);
    });
  });

  describe('removeSubscription', () => {
    it('should remove the subscription with the given endpoint', async () => {
      await notifications.addSubscription(subscriptions[0]);
      await notifications.addSubscription(subscriptions[1]);
      await notifications.removeSubscription(subscriptions[0].endpoint);
      expect(mockDatabase.get('subscriptions').value()).toStrictEqual([subscriptions[1]]);
    });
  });

  describe('sendNotifications', () => {
    it('should send notifications to all subscriptions', async () => {
      await notifications.addSubscription(subscriptions[0]);
      await notifications.addSubscription(subscriptions[1]);
      await notifications.sendNotifications({ data: 'data' });
      expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
      expect(webpush.sendNotification).toHaveBeenNthCalledWith(1, subscriptions[0], JSON.stringify({ data: 'data' }), { vapidDetails: { privateKey: process.env.PUSH_KEY_PRIVATE, publicKey: process.env.PUSH_KEY_PUBLIC, subject: process.env.PUSH_SUBJECT } });
      expect(webpush.sendNotification).toHaveBeenNthCalledWith(2, subscriptions[1], JSON.stringify({ data: 'data' }), { vapidDetails: { privateKey: process.env.PUSH_KEY_PRIVATE, publicKey: process.env.PUSH_KEY_PUBLIC, subject: process.env.PUSH_SUBJECT } });
    });
  });
});
