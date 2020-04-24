const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const { formatDatetime } = require('../utilities/formatter');
const morningRoutine = require('../usecases/morning-routine');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const {
    event,
    connection,
    wakeUpTime,
  } = await morningRoutine.getWakeUpTime();

  let textToDisplay;
  let textToRead;
  let displayRouteOnMap = null;
  if (event && connection) {
    const weatherForecast = await morningRoutine.getWeatherForecast(event.start);

    textToDisplay = `Next Event: ${event.summary}\n`
                    + `At: ${event.location}\n`
                    + `Start: ${formatDatetime(event.start)}\n`
                    + `Wake up: ${formatDatetime(wakeUpTime)}\n\n`

                    + `Leave home: ${formatDatetime(connection.departure)}\n`
                    + `First stop: ${connection.legs[0].to}\n\n`

                    + `Weather: ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;

    textToRead = `Your next Event is ${event.summary} at ${event.location}. It starts at ${formatDatetime(event.start)}. `
                  + `You have to leave at ${formatDatetime(connection.departure)}. `
                  + `The weather will be ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;

    displayRouteOnMap = {
      origin: connection.legs[0].from,
      destination: connection.legs[connection.legs.length - 1].to,
    };
  } else if (connection) {
    const weatherForecast = await morningRoutine.getWeatherForecast(new Date());

    textToDisplay = 'No planned events.\n\n'
                    + `Weather: ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;

    textToRead = 'No planned events. '
                  + `The weather is ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;
  } else {
    const weatherForecast = await morningRoutine.getWeatherForecast(new Date());

    textToDisplay = 'I cannot find a route to your appointment.\n\n'
                    + `Weather: ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;

    textToRead = 'Sorry. I cannot find a route to your appointment. '
                  + `The weather is ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;
  }

  res.send({
    textToDisplay,
    textToRead,
    displayRouteOnMap,
    displayPointOnMap: null,
    furtherAction: 'Do you want to hear your daily quote?',
    nextLink: 'morning-routine/confirm',
  });
}));

router.get('/confirm', wrapAsync(async (req, res) => {
  const quoteOfTheDay = await morningRoutine.getQuoteOfTheDay();

  res.send({
    textToDisplay: 'Your quote of the day:\n'
                    + `"${quoteOfTheDay.quote}" - ${quoteOfTheDay.author}`,
    textToRead: `Your quote of the day is from ${quoteOfTheDay.author}. He said: ${quoteOfTheDay.quote}`,
    displayRouteOnMap: null,
    displayPointOnMap: null,
    furtherAction: null,
    nextLink: null,
  });
}));

module.exports = router;
