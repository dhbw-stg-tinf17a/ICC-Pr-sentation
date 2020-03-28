const express = require('express');
const travelPlanning = require('../usecases/travel-planning');
const wrapAsync = require('../utilities/wrap-async');
const db = require('../modules/db');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const { destinationID } = req.query;

  const {
    saturday, sunday, saturdayFree, sundayFree,
  } = await travelPlanning.isWeekendFree();

  let destination;
  let connectionToDestination;
  let connectionFromDestination;
  if (destinationID !== undefined) {
    [
      destination,
      { connectionToDestination, connectionFromDestination },
    ] = await Promise.all([
      db.getStationByID(destinationID),
      travelPlanning.planTrip({ departure: saturday, arrival: sunday, destinationID }),
    ]);
  } else {
    ({
      destination, connectionToDestination, connectionFromDestination,
    } = await travelPlanning.planRandomTrip({ departure: saturday, arrival: sunday }));
  }

  res.send({
    saturdayFree, sundayFree, destination, connectionToDestination, connectionFromDestination,
  });
}));

module.exports = router;
