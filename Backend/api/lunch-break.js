const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const { formatTime } = require('../utilities/date-formatter');
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
    textToRead += 'Unfortunately, you don\'t have time for a lunch break today, but I\'ll try to '
      + 'find a restaurant anyway.\n';
  }

  if (restaurant) {
    textToDisplay += `Restaurant: ${restaurant.poi.name} at ${restaurant.address.freeformAddress}.\n`;
    textToRead += `I recommend the restaurant ${restaurant.poi.name}.\n`;
    furtherAction = 'Do you want to know how to get to the restaurant?';
    nextLink = `lunch-break/confirm?originLatitude=${latitude}&originLongitude=${longitude}`
      + `&destinationLatitude=${restaurant.location.lat}`
      + `&destinationLongitude=${restaurant.location.lon}`
      + `&departure=${freeSlot ? freeSlot.start.toISOString() : new Date().toISOString()}`;
  } else {
    textToDisplay += 'No restaurant found.\n';
    textToRead += 'Unfortunately I could not find a restaurant for today. Sorry.\n';
  }

  res.send({
    textToDisplay,
    textToRead,
    furtherAction,
    nextLink,
  });
}));

// TODO use token instead of passing all the parameters. or even remeber last request to /
// TODO store POI ID and don't recommend it again
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

  let textToRead;
  let textToDisplay;
  let displayRouteOnMap;
  if (connection) {
    textToDisplay = `Leave for Lunch: ${formatTime(connection.departure)}\n`
                    + `First stop: ${connection.legs[0].to}\n`
                    + `Destination: ${connection.legs[connection.legs.length - 1].to}`;
    textToRead = `You have to leave at ${formatTime(connection.departure)}. `
                  + `Your first stop will be ${connection.legs[0].to}. `
                  + `Your destination is ${connection.legs[connection.legs.length - 1].to}`;
    displayRouteOnMap = {
      origin: connection.legs[0].from,
      destination: connection.legs[connection.legs.length - 1].to,
    };
  } else {
    textToDisplay = 'Can not find route to restaurant!\nSorry!';
    textToRead = 'I can not find a route to your restaurant. Sorry!';
    displayRouteOnMap = null;
  }

  res.send({
    textToDisplay,
    textToRead,
    displayRouteOnMap,
    displayPointOnMap: null,
    furtherAction: null,
    nextLink: null,
  });
}));

module.exports = router;
