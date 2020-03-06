const router = require('express').Router();
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const Quote = require("../modules/quote");

/**********************
 * Get the quote of the day
 **********************/
router.get('/', function (req, res) {
	logger.trace("router - quote - GET called on /");
	Quote.getPreferredQuoteOfTheDay()
		.then((quote) => res.status(200).send({ status: 200, data: quote }))
		.catch((error) => res.status(500).send({ status: 500, error: error }));
});

module.exports = router;
