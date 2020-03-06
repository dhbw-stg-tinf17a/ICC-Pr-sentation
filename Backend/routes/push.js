const router = require('express').Router();
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });

router.post('/subscribe', function (req, res) {
	logger.trace("router - push - POST /subscribe");
	console.log(req.body);
	res.status(200).send({});
});

module.exports = router;
