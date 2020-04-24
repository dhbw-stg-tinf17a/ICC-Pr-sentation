const express = require('express');
const travelPlanning = require('../usecases/travel-planning');
const wrapAsync = require('../utilities/wrap-async');
const { formatDatetime, formatTime, formatConnection } = require('../utilities/formatter');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const {
    saturday,
    sunday,
    weekendFree,
  } = await travelPlanning.getWeekend();

  const {
    destination,
    connectionToDestination,
    connectionFromDestination,
  } = await travelPlanning.planRandomTrip({
    departure: saturday,
    arrival: sunday,
  });

  const totalPrice = connectionToDestination.price + connectionFromDestination.price;

  const {
    saturdayWeatherForecast,
    sundayWeatherForecast,
  } = await travelPlanning.getWeatherForecast({
    saturday,
    sunday,
    destination,
  });

  let textToDisplay = '';
  let textToRead = '';

  if (weekendFree) {
    textToDisplay += 'Free next weekend.\n';
    textToRead += 'You are free next weekend.\n';
  } else {
    textToDisplay += 'Not free next weekend.\n';
    textToRead += 'Unfortunately you are not free next weekend, but I will try to find a '
      + 'travel destination anyway.\n';
  }

  textToDisplay += `Destination: ${destination.name}.\n`
    + `To destination: ${formatDatetime(connectionToDestination.departure)} - `
    + `${formatTime(connectionToDestination.arrival)}.\n`
    + `From destination: ${formatDatetime(connectionFromDestination.departure)} - `
    + `${formatTime(connectionFromDestination.arrival)}.\n`
    + `Total price: ${totalPrice} €.\n`
    + `Saturday weather: ${saturdayWeatherForecast.day.shortPhrase}.\n`
    + `Sunday weather: ${sundayWeatherForecast.day.shortPhrase}.`;

  textToRead += `You could travel to ${destination.name}.\n`
    + `You start from the main station ${formatDatetime(connectionToDestination.departure)} `
    + `and arrive at ${formatTime(connectionToDestination.arrival)}.\n`
    + `The journey back starts ${formatDatetime(connectionFromDestination.departure)} `
    + `and ends at ${formatTime(connectionFromDestination.arrival)}.\n`
    + `The total price will be ${totalPrice} Euros.\n`
    + `The weather on Saturday will be ${saturdayWeatherForecast.day.longPhrase}.\n`
    + `On Sunday it will be ${sundayWeatherForecast.day.longPhrase}.`;


  const furtherAction = 'Do you want to know how to get to the main station?';
  const nextLink = 'travel-planning/confirm'
    + `?arrival=${connectionToDestination.departure.toISOString()}`;

  res.send({
    textToDisplay,
    textToRead,
    furtherAction,
    nextLink,
  });
}));

router.get('/confirm', wrapAsync(async (req, res) => {
  const connection = await travelPlanning.getConnectionToMainStation(req.query.arrival);

  let textToRead = '';
  let textToDisplay = '';

  if (connection) {
    textToDisplay += `Leave at: ${formatTime(connection.departure)}.\n`
      + `Go to ${formatConnection(connection)}.`;
    textToRead += `You have to leave at ${formatTime(connection.departure)}.\n`
                  + `Go to ${formatConnection(connection)}.`;
  } else {
    textToDisplay += 'No route found.';
    textToRead += 'I did not find a route to the main station. Sorry!';
  }

  res.send({
    textToDisplay,
    textToRead,
  });
}));

module.exports = router;
