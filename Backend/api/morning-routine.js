const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const morningRoutine = require('../usecases/morning-routine');

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
  const quoteOfTheDay = await morningRoutine.getQuoteOfTheDay();
  res.send(quoteOfTheDay);
}));

module.exports = router;
