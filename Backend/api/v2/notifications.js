const express = require('express');
const notifications = require('../../modules/notifications');
const wrapAsync = require('../../utilities/wrap-async');

const router = express.Router();

router.post('/enable', wrapAsync(async (req, res) => {
  const subscription = req.body;

  await Promise.all([
    notifications.addSubscription(subscription),
    notifications.sendNotification(
      {
        title: 'A notification from Gunter!',
        options: {
          body: 'It works :)',
          icon: '/favicon.jpg',
          badge: '/badge.png',
        },
      },
      subscription,
    ),
  ]);

  res.send({});
}));

router.post('/disable', wrapAsync(async (req, res) => {
  await notifications.removeSubscription(req.body.endpoint);

  res.send({});
}));

module.exports = router;
