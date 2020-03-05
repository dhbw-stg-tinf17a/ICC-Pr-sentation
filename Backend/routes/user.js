const router = require('express').Router();
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const User = require("../modules/user");

/**********************
 * Get the user's info
 **********************/
router.get('/', function (req, res) {
	logger.trace("router - users - GET called on /");
	User.getUser()
		.then((user) => res.status(200).send({ status: 200, data: user }))
		.catch((error) => res.status(500).send({ status: 500, error: error }));
});

module.exports = router;
