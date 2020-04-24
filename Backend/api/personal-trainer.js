const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const { formatTime } = require('../utilities/formatter');
const personalTrainer = require('../usecases/personal-trainer');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const [
    freeSlot,
    weatherForecast,
  ] = await Promise.all([
    personalTrainer.getFreeSlotForActivity(),
    personalTrainer.getWeatherForecast(),
  ]);

  let place;
  let textToDisplay = '';
  let textToRead = '';
  let furtherAction;
  let nextLink;

  if (freeSlot) {
    textToDisplay += `Training slot: ${formatTime(freeSlot.start)} - `
      + `${formatTime(freeSlot.end)}.\n`;
    textToRead += `You have time for training from ${formatTime(freeSlot.start)} to `
      + `${formatTime(freeSlot.end)}.\n`;
  } else {
    textToDisplay += 'No time for training.\n';
    textToRead += 'Unfortunately, you do not have time for training today, but I will try to find '
      + 'a training place anyway.\n';
  }

  if (weatherForecast.day.hasPrecipitation) {
    textToDisplay += 'It rains today, train indoors.\n';
    textToRead += 'Since it rains today, I recommend training indoors.\n';
    place = await personalTrainer.getRandomSportsCenter();
  } else {
    textToDisplay += 'It is sunny, train outdoors.\n';
    textToRead += 'Since it is sunny today, I recommend training outdoors.\n';
    place = await personalTrainer.getRandomParkRecreationArea();
  }

  if (place) {
    textToDisplay += `Training place: ${place.poi.name} at ${place.address.freeformAddress}.`;
    textToRead += `I recommend the training place ${place.poi.name}.`;
    furtherAction = 'Do you want to know how to get there?';
    nextLink = `personal-trainer/confirm?latitude=${place.position.lat}`
      + `&longitude=${place.position.lon}&departure=${freeSlot.start.toISOString()}`;
  } else {
    textToDisplay += 'No training place found.';
    textToRead += 'Unfortunately I did not find a training place. Train at home.';
  }

  res.send({
    textToDisplay,
    textToRead,
    furtherAction,
    nextLink,
  });
}));

// TODO use token instead of passing all the parameters. or even remeber last request to /
// TODO store POI ID and do not recommend it again
router.get('/confirm', wrapAsync(async (req, res) => {
  const {
    latitude,
    longitude,
    departure,
  } = req.query;

  const connection = await personalTrainer.getConnectionToPlace({
    latitude,
    longitude,
    departure,
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
    textToDisplay = 'did not find route to training location.\nSorry!';
    textToRead = 'I did not find a route to your training location. Sorry!';
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
