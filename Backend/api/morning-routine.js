const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const morningRoutine = require('../usecases/morning-routine');
const quote = require('../modules/quote');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const [
    { event, connection, wakeUpTime },
    weatherForecast,
  ] = await Promise.all([
    morningRoutine.getWakeUpTimeForFirstEventOfToday(),
    morningRoutine.getWeatherForecast(),
  ]);

  res.send({
    event, connection, wakeUpTime, weatherForecast,
  });
}));

router.get('/confirm', wrapAsync(async (req, res) => {
  const quoteOfTheDay = await quote.getPreferredQuoteOfTheDay();
  res.send(quoteOfTheDay);
}));

module.exports = router;
