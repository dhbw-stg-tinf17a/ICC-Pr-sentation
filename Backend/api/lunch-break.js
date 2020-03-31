const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const { formatTime } = require('../utilities/date-formatter');
const lunchBreak = require('../usecases/lunch-break');
const preferences = require('../modules/preferences');
const vvs = require('../modules/vvs');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const { latitude, longitude } = req.query;

  const pref = await preferences.get();

  const [
    freeSlot,
    restaurant,
  ] = await Promise.all([
    lunchBreak.getFreeSlotForLunchbreak(pref),
    lunchBreak.getRandomRestaurantNear({
      latitude,
      longitude,
      pref,
    }),
  ]);

  res.send({
    textToDisplay: `Lunch Break from: ${formatTime(freeSlot.start)}\n`
                    + `To: ${formatTime(freeSlot.end)}\n\n`
                    + `Restaurant: ${restaurant.poi.name}\n`
                    + `On: ${restaurant.address.streetName} Street`,
    textToRead: `Your have time for a Lunch Break from ${formatTime(freeSlot.start)} to `
                + ` ${formatTime(freeSlot.end)}. I recommend ${restaurant.poi.name} on ${restaurant.address.streetName} Street.`,
    displayRouteOnMap: null,
    displayPointOnMap: {
      longitude: restaurant.position.lat,
      latitude: restaurant.position.lon,
    },
    furtherAction: null,
    nextLink: null,
  });
}));

// TODO use token instead of passing all the parameters. or even remeber last request to /
// TODO store POI ID and don't recommend it again
router.get('/confirm', wrapAsync(async (req, res) => {
  const {
    originLatitude, originLongitude, destinationLatitude, destinationLongitude, departure,
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
