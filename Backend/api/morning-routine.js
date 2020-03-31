const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const formatDate = require('../utilities/date-formatter');
const morningRoutine = require('../usecases/morning-routine');
const preferences = require('../modules/preferences');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const pref = await preferences.get();

  const [
    { event, connection, wakeUpTime },
    weatherForecast,
  ] = await Promise.all([
    morningRoutine.getWakeUpTimeForFirstEventOfToday(pref),
    morningRoutine.getWeatherForecast(pref),
  ]);

  let textToDisplay;
  let textToRead;
  let displayRouteOnMap = null;
  if (!event) {
    textToDisplay = 'No planned events.\n\n'
                    + `Weather: ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;

    textToRead = 'No planned events. '
                  + `The weather is ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;
  } else {
    textToDisplay = `Next Event: ${event.summary}\n`
                    + `At: ${event.location}\n`
                    + `Start: ${formatDate(event.start)}\n`
                    + `Wake up: ${formatDate(wakeUpTime)}\n\n`

                    + `Leave home: ${formatDate(connection.departure)}\n`
                    + `First stop: ${connection.legs[0].to}\n\n`

                    + `Weather: ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;

    textToRead = `Your next Event is ${event.summary} at ${event.location}. It starts at ${formatDate(event.start)}. `
                  + `You have to leave at ${formatDate(connection.departure)}. `
                  + `The weather is ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;

    displayRouteOnMap = {
      origin: connection.legs[0].from,
      destination: connection.legs[connection.legs.length - 1].to,
    };
  }

  res.send({
    textToDisplay,
    textToRead,
    displayRouteOnMap,
    displayPointOnMap: null,
    furtherAction: 'Do you want to hear your daily quote?',
    nextLink: '/confirm',
  });
}));

router.get('/confirm', wrapAsync(async (req, res) => {
  const pref = await preferences.get();

  const quoteOfTheDay = await morningRoutine.getQuoteOfTheDay(pref);

  res.send({ quoteOfTheDay });
}));

module.exports = router;
