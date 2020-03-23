const express = require('express');
const travelPlanning = require('../usecases/travel-planning');
const wrapAsync = require('../utilities/wrap-async');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  let { destination } = req.query;

  const {
    saturday, sunday, saturdayFree, sundayFree,
  } = await travelPlanning.isWeekendFree();

  let connectionToDestination;
  let connectionFromDestination;
  if (destination) {
    ({
      connectionToDestination, connectionFromDestination,
    } = await travelPlanning.planTrip({ departure: saturday, arrival: sunday, destination }));
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
