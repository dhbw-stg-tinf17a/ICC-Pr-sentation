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

  let textToDisplay;
  let textToRead;
  let displayPointOnMap = null;
  let furtherAction = null;
  let nextLink = null;
  if (freeSlot && restaurant) {
    textToDisplay = `Lunch Break from: ${formatTime(freeSlot.start)}\n`
                    + `To: ${formatTime(freeSlot.end)}\n\n`
                    + `Restaurant: ${restaurant.poi.name}\n`
                    + `Address: ${restaurant.address.freeformAddress}\n`
                    + `Distance: ${Math.trunc(restaurant.dist)}m`;
    textToRead = `Your have time for a Lunch Break from ${formatTime(freeSlot.start)} to `
                + ` ${formatTime(freeSlot.end)}. I recommend ${restaurant.poi.name} on ${restaurant.address.streetName} Street.`;
    displayPointOnMap = {
      longitude: restaurant.position.lat,
      latitude: restaurant.position.lon,
    };
    furtherAction = 'Do you want to know how to get to the restaurant?';
    nextLink = `lunch-break/confirm?originLatitude=${latitude}&originLongitude=${longitude}`
                + `&destinationLatitude=${restaurant.position.lat}&destinationLongitude=${restaurant.position.lon}`
                + `&departure=${freeSlot.start.toISOString()}`;
  } else if (restaurant) {
    textToDisplay = 'No time for lunch break today';
    textToRead = 'Today you have no free slot in your calendar for a lunch break!';
  } else {
    textToDisplay = 'No restaurant found.\nSorry!';
    textToRead = 'Unfortunately I could not find a restaurant for today. Sorry.';
  }

  res.send({
    textToDisplay,
    textToRead,
    displayRouteOnMap: null,
    displayPointOnMap,
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
