const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const personalTrainer = require('../usecases/personal-trainer');
const preferences = require('../modules/preferences');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const pref = await preferences.get();

  const [
    freeSlot,
    weatherForecast,
  ] = await Promise.all([
    personalTrainer.getFreeSlotForActivity(pref),
    personalTrainer.getWeatherForecast(pref),
  ]);

  let place;
  if (weatherForecast.day.hasPrecipitation) {
    place = await personalTrainer.getRandomSportsCenter(pref);
  } else {
    place = await personalTrainer.getRandomParkRecreationArea(pref);
  }

  res.send({
    freeSlot,
    weatherForecast,
    place,
  });
}));

// TODO use token instead of passing all the parameters. or even remeber last request to /
// TODO store POI ID and don't recommend it again
router.get('/confirm', wrapAsync(async (req, res) => {
  const { latitude, longitude, departure } = req.query;

  const pref = await preferences.get();

  const connection = await personalTrainer.getConnectionToPlace({
    latitude,
    longitude,
    departure,
    pref,
  });

  res.send({ connection });
}));

module.exports = router;
