const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const morningRoutine = require('../usecases/morning-routine');
const quote = require('../modules/quote');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const [
    { event, departure, wakeUpTime },
    weatherForecast,
  ] = await Promise.all([
    morningRoutine.getWakeUpTimeForNextFirstEventOfDay(),
    morningRoutine.getWeatherForecastAtHome(),
  ]);

  res.send({
    event, departure, wakeUpTime, weatherForecast,
  });
}));

router.get('/quote-of-the-day', wrapAsync(async (req, res) => {
  const quoteOfTheDay = await quote.getPreferredQuoteOfTheDay();
  res.send(quoteOfTheDay);
}));

module.exports = router;
