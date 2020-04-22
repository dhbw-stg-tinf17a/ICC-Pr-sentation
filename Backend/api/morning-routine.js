const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const { formatDate } = require('../utilities/date-formatter');
const morningRoutine = require('../usecases/morning-routine');
const preferences = require('../modules/preferences');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const pref = await preferences.get();

  const { event, connection, wakeUpTime } = await Promise.resolve(
    morningRoutine.getWakeUpTime(pref),
  );

  let textToDisplay;
  let textToRead;
  let displayRouteOnMap = null;
  if (event && connection) {
    const weatherForecast = await morningRoutine.getWeatherForecast({
      pref, datetime: event.start,
    });

    textToDisplay = `Next Event: ${event.summary}\n`
                    + `At: ${event.location}\n`
                    + `Start: ${formatDate(event.start)}\n`
                    + `Wake up: ${formatDate(wakeUpTime)}\n\n`

                    + `Leave home: ${formatDate(connection.departure)}\n`
                    + `First stop: ${connection.legs[0].to}\n\n`

                    + `Weather: ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;

    textToRead = `Your next Event is ${event.summary} at ${event.location}. It starts at ${formatDate(event.start)}. `
                  + `You have to leave at ${formatDate(connection.departure)}. `
                  + `The weather will be ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;

    displayRouteOnMap = {
      origin: connection.legs[0].from,
      destination: connection.legs[connection.legs.length - 1].to,
    };
  } else if (connection) {
    const weatherForecast = await morningRoutine.getWeatherForecast({ pref, datetime: new Date() });

    textToDisplay = 'No planned events.\n\n'
                    + `Weather: ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;

    textToRead = 'No planned events. '
                  + `The weather is ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;
  } else {
    const weatherForecast = await morningRoutine.getWeatherForecast({ pref, datetime: new Date() });

    textToDisplay = 'Can not find a route to your appointment.\n\n'
                    + `Weather: ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;

    textToRead = 'Sorry. I can not find a route to your appointment. '
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
  const pref = await preferences.get();

  const quoteOfTheDay = await morningRoutine.getQuoteOfTheDay(pref);

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
