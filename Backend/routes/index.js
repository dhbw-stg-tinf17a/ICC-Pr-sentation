const router = require('express').Router();
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });

/** Landing page */
router.get('/', (req, res) => {
	logger.trace('router - index - GET called on /');
	const welcomeMessage = 'Welcome to Gunter\'s heart - I am the backend.Feel free to leave, since you should let the frontend talk to me.';
	res.status(200).send({ status: 200, data: welcomeMessage });
});

router.use('/user', require('./user'));

module.exports = router;
