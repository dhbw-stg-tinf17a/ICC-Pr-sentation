const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const { formatTime, formatConnection } = require('../utilities/formatter');
const lunchBreak = require('../usecases/lunch-break');
const vvs = require('../modules/vvs');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const {
    latitude,
    longitude,
  } = req.query;

  const [
    freeSlot,
    restaurant,
  ] = await Promise.all([
    lunchBreak.getFreeSlotForLunchbreak(),
    lunchBreak.getRandomRestaurantNear({
      latitude,
      longitude,
    }),
  ]);

  let textToDisplay = '';
  let textToRead = '';
  let furtherAction;
  let nextLink;

  if (freeSlot) {
    textToDisplay += `Lunch break: ${formatTime(freeSlot.start)} - ${formatTime(freeSlot.end)}.\n`;
    textToRead += `You have time for a lunch break from ${formatTime(freeSlot.start)} to `
      + `${formatTime(freeSlot.end)}.\n`;
  } else {
    textToDisplay += 'No time for a lunch break.\n';
    textToRead += 'Unfortunately, you do not have time for a lunch break today, but I will try to '
      + 'find a restaurant anyway.\n';
  }

  if (restaurant) {
    textToDisplay += `Restaurant: ${restaurant.poi.name} at ${restaurant.address.freeformAddress}.`;
    textToRead += `I recommend the restaurant ${restaurant.poi.name}.`;
    furtherAction = 'Do you want to know how to get to the restaurant?';
    nextLink = `lunch-break/confirm?originLatitude=${latitude}&originLongitude=${longitude}`
      + `&destinationLatitude=${restaurant.location.lat}`
      + `&destinationLongitude=${restaurant.location.lon}`
      + `&departure=${freeSlot ? freeSlot.start.toISOString() : new Date().toISOString()}`;
  } else {
    textToDisplay += 'No restaurant found.';
    textToRead += 'Unfortunately I did not find a restaurant for today. Sorry.';
  }

  res.send({
    textToDisplay,
    textToRead,
    furtherAction,
    nextLink,
  });
}));

router.get('/confirm', wrapAsync(async (req, res) => {
  const {
    originLatitude,
    originLongitude,
    destinationLatitude,
    destinationLongitude,
    departure,
  } = req.query;

  const connection = await vvs.getConnection({
    originCoordinates: {
      latitude: originLatitude,
      longitude: originLongitude,
    },
    destinationCoordinates: {
      latitude: destinationLatitude,
      longitude: destinationLongitude,
    },
    departure,
  });

  let textToRead = '';
  let textToDisplay = '';

  if (connection) {
    textToDisplay += `Leave at: ${formatTime(connection.departure)}.\n`
      + `Go to ${formatConnection(connection)}.`;
    textToRead += `You have to leave at ${formatTime(connection.departure)}.\n`
                  + `Go to ${formatConnection(connection)}.`;
  } else {
    textToDisplay += 'No route found.';
    textToRead += 'I did not find a route to the restaurant. Sorry!';
  }

  res.send({
    textToDisplay,
    textToRead,
  });
}));

module.exports = router;
