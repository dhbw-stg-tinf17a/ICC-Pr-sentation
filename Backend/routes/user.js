const router = require('express').Router();

const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

/**********************
 * Get the user's info
 **********************/
router.get('/', function (req, res) {
	logger.trace("router - users - GET called on /");
	const user = {
		"name": "Gunter",
		"age": 107,
		"favouriteFood": "Jelly Beans",
		"loyal": true
	};
	res.status(200).send({ status: 200, data: user });
});

module.exports = router;
