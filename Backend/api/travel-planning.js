const express = require('express');
const travelPlanning = require('../usecases/travel-planning');
const wrapAsync = require('../utilities/wrap-async');
const formatDate = require('../utilities/date-formatter');
const db = require('../modules/db');
const preferences = require('../modules/preferences');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const { destinationID } = req.query;

  const pref = await preferences.get();

  const {
    saturday, sunday, saturdayFree, sundayFree,
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

  let freeDays;
  let weatherForecast;
  if (saturdayFree) {
    freeDays = 'Saturday';
    weatherForecast = `Saturday: ${saturdayWeatherForecast.day.shortPhrase}`;
    if (sundayFree) {
      freeDays += ' and Sunday';
      weatherForecast += `\nSunday: ${sundayWeatherForecast.day.shortPhrase}`;
    }
  } else if (sundayFree) {
    freeDays = 'Sunday';
    weatherForecast = `Sunday: ${sundayWeatherForecast.day.shortPhrase}`;
  }

  res.send({
    textToDisplay: `Free on: ${freeDays}\n`
                    + `Destination: ${destination.name} in ${destination.address.city}\n`
                    + `Depart from ${connectionToDestination.legs[0].from}, ${formatDate(connectionToDestination.legs[0].departure)}\n`
                    + `Arrive at ${connectionToDestination.legs[connectionToDestination.legs.length - 1].to},`
                    + `${formatDate(connectionToDestination.legs[connectionToDestination.legs.length - 1].arrival)}\n`
                    + `Price: ${connectionToDestination.price}€ + ${connectionFromDestination.price}€\n\n`

                    + `Return from ${connectionFromDestination.legs[0].from}, ${formatDate(connectionFromDestination.legs[0].departure)}\n`
                    + `Arrive home at ${connectionFromDestination.legs[connectionFromDestination.legs.length - 1].to},`
                    + `${formatDate(connectionFromDestination.legs[connectionFromDestination.legs.length - 1].arrival)}\n\n`

                    + `${weatherForecast}`,

    textToRead: `You are free on ${freeDays}. You could travel to ${destination.name} in `
                + `${destination.address.city}. Your train leaves from ${connectionToDestination.legs[0].from} at `
                + `${formatDate(connectionToDestination.legs[0].departure)}. You will arrive at `
                + `${connectionToDestination.legs[connectionToDestination.legs.length - 1].to} at `
                + `${formatDate(connectionToDestination.legs[connectionToDestination.legs.length - 1].arrival)}. `
                + `The total price will be ${connectionToDestination.price + connectionFromDestination.price}€. `
                + `The weather will be ${saturdayWeatherForecast.day.shortPhrase}`,

    displayRouteOnMap: {
      origin: connectionToDestination.legs[0].from,
      destination: connectionToDestination.legs[connectionToDestination.legs.length - 1].to,
    },
    displayPointOnMap: null,
    furtherAction: 'Do you want to get information about how to get to your origin train station?',
    nextLink: '/confirm',
  });
}));

// TODO remeber last request to /
// TODO store destination and don't recommend it again
router.get('/confirm', wrapAsync(async (req, res) => {
  const pref = await preferences.get();

  const connection = await travelPlanning.getConnectionToMainStation({
    arrival: req.query.arrival,
    pref,
  });

  res.send({ connection });
}));

module.exports = router;
