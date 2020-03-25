const webpush = require('web-push');
const initDatabase = require('../utilities/init-database');

const database = initDatabase('notifications', { subscriptions: [] });

async function addSubscription(subscription) {
  const subscriptions = (await database).get('subscriptions');

  if (await subscriptions.findIndex({ endpoint: subscription.endpoint }).value() >= 0) {
    // subscription already stored
    return;
  }

  await subscriptions.push(subscription).write();
}

async function removeSubscription(endpoint) {
  await (await database).get('subscriptions').remove({ endpoint }).write();
}

async function sendNotification(payload, subscription) {
  await webpush.sendNotification(
    subscription,
    JSON.stringify(payload),
    {
      vapidDetails: {
        subject: process.env.PUSH_SUBJECT,
        privateKey: process.env.PUSH_KEY_PRIVATE,
        publicKey: process.env.PUSH_KEY_PUBLIC,
      },
    },
  );
}

async function sendNotifications(payload) {
  const subscriptions = await (await database).get('subscriptions').value();
  await Promise.all(subscriptions.map((subscription) => sendNotification(payload, subscription)));
}

module.exports = {
  addSubscription, removeSubscription, sendNotification, sendNotifications,
};
