const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const lunchBreak = require('../usecases/lunch-break');
const vvs = require('../modules/vvs');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const { latitude, longitude } = req.query;

  const [
    freeSlot,
    restaurant,
  ] = await Promise.all([
    lunchBreak.getFreeSlotForLunchbreak(),
    lunchBreak.getRandomRestaurantNear({ latitude, longitude }),
  ]);

  res.send({ freeSlot, restaurant });
}));

// TODO use token instead of passing all the parameters. or even remeber last request to /
router.get('/connection', wrapAsync(async (req, res) => {
  const {
    originLatitude, originLongitude, destinationLatitude, destinationLongitude, departure,
  } = req.query;

  const connection = await vvs.getConnection({
    originCoordinates: { latitude: originLatitude, longitude: originLongitude },
    destinationCoordinates: { latitude: destinationLatitude, longitude: destinationLongitude },
    departure,
  });

  res.send({ connection });
}));

module.exports = router;
