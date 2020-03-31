const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const { formatTime } = require('../utilities/date-formatter');
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
  let trainingLocation;
  if (weatherForecast.day.hasPrecipitation) {
    place = await personalTrainer.getRandomSportsCenter(pref);
    trainingLocation = 'indoor';
  } else {
    place = await personalTrainer.getRandomParkRecreationArea(pref);
    trainingLocation = 'outdoor';
  }

  let textToDisplay;
  let textToRead;
  let displayPointOnMap = null;
  if (freeSlot && place) {
    textToDisplay = 'Found a free slot to train!\n'
                    + `Start: ${formatTime(freeSlot.start)}\n`
                    + `End: ${formatTime(freeSlot.end)}\n\n`
                    + `Todays ${trainingLocation} location: ${place.poi.name}\n`
                    + `Distance: ${Math.trunc(place.dist)}m\n\n`
                    + `Weather: ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C`;
    textToRead = `You have a free slot to train. You are free from ${formatTime(freeSlot.start)} `
                  + `until ${formatTime(freeSlot.end)}. `
                  + `The weather is ${weatherForecast.day.shortPhrase} with ${weatherForecast.temperature.maximum.value}°C. `
                  + `Today it would be better to train ${trainingLocation} at ${place.poi.name}.`;
    displayPointOnMap = {
      longitude: place.position.lat,
      latitude: place.position.lon,
    };
  } else if (place) {
    textToDisplay = 'No free slot to train.\nMaybe Tomorrow!';
    textToRead = 'Unfortunately there is no free slot for training today. '
                  + 'I will get back to you tomorrow!';
  } else {
    textToDisplay = 'No fitting location found.\nTrain at home!';
    textToRead = 'Unfortunately I could not find a fitting location. '
                  + 'You have to train at home today!';
  }

  res.send({
    textToDisplay,
    textToRead,
    displayRouteOnMap: null,
    displayPointOnMap,
    furtherAction: 'Do you want to know how to get to your training location?',
    nextLink: '/confirm',
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

  let textToRead;
  let textToDisplay;
  let displayRouteOnMap;
  if (connection) {
    textToDisplay = `Leave home: ${formatTime(connection.departure)}\n`
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
    textToDisplay = 'Can not find route to training location.\nSorry!';
    textToRead = 'I can not find a route to your training location. Sorry!';
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
