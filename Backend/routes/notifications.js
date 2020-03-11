const router = require('express').Router();
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const webpush = require('web-push');
const { addSubscription, removeSubscription } = require('../modules/notifications');


webpush.setVapidDetails(
  'https://gunter.felixsz.de',
  process.env.PUSH_KEY_PUBLIC,
  process.env.PUSH_KEY_PRIVATE,
);

router.post('/enable', async (req, res) => {
  try {
    const subscription = req.body;

    await Promise.all([
      addSubscription(subscription),
      webpush.sendNotification(subscription, JSON.stringify({
        title: 'A notification from Gunter!',
        options: {
          body: 'It works :)',
          icon: '/favicon.jpg',
          badge: '/badge.png',
        },
      })),
    ]);

    res.status(200).send({});
  } catch (err) {
    logger.error(err);
    res.status(500).send({
      error: err,
    });
  }
});

router.post('/disable', async (req, res) => {
  logger.trace(req.body);

  await removeSubscription(req.body.endpoint);

  res.status(200).send({});
});

module.exports = router;
