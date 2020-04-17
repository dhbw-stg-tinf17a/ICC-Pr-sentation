const express = require('express');
const wrapAsync = require('../../utilities/wrap-async');
const morningRoutine = require('../../usecases/morning-routine');
const preferences = require('../../modules/preferences');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const pref = await preferences.get();

  const { event, connection, wakeUpTime } = await morningRoutine.getWakeUpTime(pref);
  const weatherForecast = await morningRoutine.getWeatherForecast({
    pref,
    datetime: event === undefined ? new Date() : event.start,
  });

  res.send({
    event,
    connection,
    wakeUpTime,
    weatherForecast,
  });
}));

router.get('/confirm', wrapAsync(async (req, res) => {
  const pref = await preferences.get();

  const quoteOfTheDay = await morningRoutine.getQuoteOfTheDay(pref);

  res.send({ quoteOfTheDay });
}));

module.exports = router;
