const router = require('express').Router();
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const webpush = require('web-push');
const { addSubscription } = require('../modules/notifications');


webpush.setVapidDetails(
	'https://gunter.felixsz.de',
	process.env.PUSH_KEY_PUBLIC,
	process.env.PUSH_KEY_PRIVATE,
);

router.post('/enable', async (req, res) => {
	try {
		logger.trace("router - push - POST /enable");

		const subscription = req.body;

		await Promise.all([
			addSubscription(subscription),
			webpush.sendNotification(subscription, JSON.stringify({
				title: 'A notification from Gunter!', options: {
					body: 'It works :)',
					icon: '/favicon.jpg',
					badge: '/badge.png',
				},
			})),
		]);

		res.status(200).send({});
	} catch (err) {
		logger.error(err);
	}
});

router.post('/disable', async (req, res) => {
	res.status(200).send({});
});

module.exports = router;
