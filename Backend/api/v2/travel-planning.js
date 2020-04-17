const express = require('express');
const travelPlanning = require('../../usecases/travel-planning');
const wrapAsync = require('../../utilities/wrap-async');
const db = require('../../modules/db');
const preferences = require('../../modules/preferences');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const { destinationID } = req.query;

  const pref = await preferences.get();

  const {
    saturday, sunday, weekendFree,
  } = await travelPlanning.getWeekend();

  let destination;
  let connectionToDestination;
  let connectionFromDestination;
  let saturdayWeatherForecast;
  let sundayWeatherForecast;

  if (destinationID !== undefined) {
    [
      destination,
      { connectionToDestination, connectionFromDestination },
    ] = await Promise.all([
      db.getStationByID(destinationID),
      travelPlanning.planTrip({
        departure: saturday,
        arrival: sunday,
        destinationID,
      }),
    ]);

    ({ saturdayWeatherForecast, sundayWeatherForecast } = await travelPlanning.getWeatherForecast({
      saturday,
      sunday,
      destination,
    }));
  } else {
    ({
      destination, connectionToDestination, connectionFromDestination,
    } = await travelPlanning.planRandomTrip({
      departure: saturday,
      arrival: sunday,
      pref,
    }));

    ({ saturdayWeatherForecast, sundayWeatherForecast } = await travelPlanning.getWeatherForecast({
      saturday,
      sunday,
      destination,
    }));
  }

  res.send({
    saturday,
    sunday,
    weekendFree,
    destination,
    connectionToDestination,
    connectionFromDestination,
    saturdayWeatherForecast,
    sundayWeatherForecast,
  });
}));

// TODO remeber last request to /
// TODO store destination and don't recommend it again
router.get('/confirm', wrapAsync(async (req, res) => {
  const { arrival } = req.query;

  const pref = await preferences.get();

  const connection = await travelPlanning.getConnectionToMainStation({
    arrival,
    pref,
  });

  res.send({ connection });
}));

module.exports = router;
