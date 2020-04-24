const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const { formatDatetime, formatConnection, formatTime } = require('../utilities/formatter');
const morningRoutine = require('../usecases/morning-routine');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const {
    event,
    connection,
    wakeUpTime,
  } = await morningRoutine.getWakeUpTime();

  let textToDisplay = '';
  let textToRead = '';

  if (event) {
    textToDisplay += `Event: ${event.summary}.\n`
      + `Start: ${formatDatetime(event.start)}.\n`;
    textToRead += `Your next event is ${event.summary}.\n`
      + `It starts at ${formatDatetime(event.start)}.\n`;

    if (connection) {
      textToDisplay += `Leave at: ${formatTime(connection.departure)}.\n`
        + `Go to ${formatConnection(connection)}.\n`;
      textToRead += `You have to leave at ${formatTime(connection.departure)}.\n`
        + `Go to ${formatConnection(connection)}.\n`;
    }

    textToDisplay += `Wake up at: ${formatTime(wakeUpTime)}.\n`;
    textToRead += `Wake up at ${formatTime(wakeUpTime)}.\n`;
  } else {
    textToDisplay += 'No event.\n';
    textToRead += 'I did not find a relevant event.\n';
  }

  const weatherForecast = await morningRoutine.getWeatherForecast(event ? event.start : new Date());

  textToDisplay += `Weather: ${weatherForecast.day.shortPhrase}.`;
  textToRead += `The weather will be ${weatherForecast.day.longPhrase}.`;

  res.send({
    textToDisplay,
    textToRead,
    furtherAction: 'Do you want to hear your quote of the day?',
    nextLink: 'morning-routine/confirm',
  });
}));

router.get('/confirm', wrapAsync(async (req, res) => {
  const quoteOfTheDay = await morningRoutine.getQuoteOfTheDay();

  res.send({
    textToDisplay: `Quote of the day: "${quoteOfTheDay.quote}" - ${quoteOfTheDay.author}.`,
    textToRead: `Your quote of the day is from ${quoteOfTheDay.author}. `
      + `He said ${quoteOfTheDay.quote}`,
  });
}));

module.exports = router;
