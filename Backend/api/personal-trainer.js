const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const personalTrainer = require('../usecases/personal-trainer');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const [
    freeSlot,
    weather,
  ] = await Promise.all([
    personalTrainer.getFreeSlotForActivity(),
    personalTrainer.getWeather(),
  ]);

  let place;
  if (weather.day.hasPrecipitation) {
    place = await personalTrainer.getRandomSportsCenter();
  } else {
    place = await personalTrainer.getRandomParkRecreationArea();
  }

  res.send({ freeSlot, weather, place });
}));

// TODO use token instead of passing all the parameters. or even remeber last request to /
// TODO store POI ID and don't recommend it again
router.get('/confirm', wrapAsync(async (req, res) => {
  const { latitude, longitude, departure } = req.query;

  const connection = await personalTrainer.getConnectionToPlace({ latitude, longitude, departure });

  res.send({ connection });
}));

module.exports = router;
