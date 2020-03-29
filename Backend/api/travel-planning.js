const express = require('express');
const travelPlanning = require('../usecases/travel-planning');
const wrapAsync = require('../utilities/wrap-async');
const db = require('../modules/db');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const { destinationID } = req.query;

  const {
    saturday, sunday, saturdayFree, sundayFree,
  } = await travelPlanning.getWeekend();

  let destination;
  let connectionToDestination;
  let connectionFromDestination;
  let saturdayWeather;
  let sundayWeather;
  if (destinationID !== undefined) {
    [
      destination,
      { connectionToDestination, connectionFromDestination },
      { saturdayWeather, sundayWeather },
    ] = await Promise.all([
      db.getStationByID(destinationID),
      travelPlanning.planTrip({ departure: saturday, arrival: sunday, destinationID }),
      travelPlanning.getWeather({ saturday, sunday }),
    ]);
  } else {
    ({
      destination, connectionToDestination, connectionFromDestination,
    } = await travelPlanning.planRandomTrip({ departure: saturday, arrival: sunday }));
    ({
      saturdayWeather, sundayWeather,
    } = await travelPlanning.getWeather({ saturday, sunday, destination }));
  }

  res.send({
    saturdayFree,
    sundayFree,
    destination,
    connectionToDestination,
    connectionFromDestination,
    saturdayWeather,
    sundayWeather,
  });
}));

// TODO remeber last request to /
// TODO store destination and don't recommend it again
router.get('/confirm', wrapAsync(async (req, res) => {
  const connection = await travelPlanning.getConnectionToMainStation(req.query.arrival);
  res.send({ connection });
}));

module.exports = router;
