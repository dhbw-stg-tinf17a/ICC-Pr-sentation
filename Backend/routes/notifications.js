const express = require('express');
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const notifications = require('../modules/notifications');

const router = express.Router();

router.post('/enable', async (req, res) => {
  try {
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
  } catch (err) {
    logger.error(err);
    res.status(500).send({
      error: err,
    });
  }
});

router.post('/disable', async (req, res) => {
  await notifications.removeSubscription(req.body.endpoint);

  res.send({});
});

module.exports = router;
