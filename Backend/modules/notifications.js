const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const webpush = require('web-push');

let db;

(async () => {
  const adapter = new FileAsync('db/notifications.json');
  db = (await low(adapter)).defaults({ subscriptions: [] });
})();

async function addSubscription(subscription) {
  const subscriptions = db.get('subscriptions');

  if (await subscriptions.findIndex({ endpoint: subscription.endpoint }).value() >= 0) {
    // subscription already stored
    return;
  }

  await subscriptions.push(subscription).write();
}

async function removeSubscription(endpoint) {
  await db.get('subscriptions').remove({ endpoint }).write();
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
  const subscriptions = await db.get('subscriptions').value();
  await Promise.all(subscriptions.map((subscription) => sendNotification(payload, subscription)));
}

module.exports = {
  addSubscription, removeSubscription, sendNotification, sendNotifications,
};
