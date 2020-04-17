const express = require('express');
const wrapAsync = require('../../utilities/wrap-async');
const lunchBreak = require('../../usecases/lunch-break');
const preferences = require('../../modules/preferences');
const vvs = require('../../modules/vvs');

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
    freeSlot,
    restaurant,
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

  res.send({ connection });
}));

module.exports = router;
