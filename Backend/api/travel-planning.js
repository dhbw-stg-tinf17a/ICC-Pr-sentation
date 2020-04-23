const express = require('express');
const travelPlanning = require('../usecases/travel-planning');
const wrapAsync = require('../utilities/wrap-async');
const { formatDate } = require('../utilities/date-formatter');
const db = require('../modules/db');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const { destinationID } = req.query;

  const {
    saturday,
    sunday,
    weekendFree,
  } = await travelPlanning.getWeekend();

  let destination;
  let connectionToDestination;
  let connectionFromDestination;
  let saturdayWeatherForecast;
  let sundayWeatherForecast;

  if (destinationID !== undefined) {
    [
      destination,
      {
        connectionToDestination,
        connectionFromDestination,
      },
    ] = await Promise.all([
      db.getStationByID(destinationID),
      travelPlanning.planTrip({
        departure: saturday,
        arrival: sunday,
        destinationID,
      }),
    ]);

    ({
      saturdayWeatherForecast,
      sundayWeatherForecast,
    } = await travelPlanning.getWeatherForecast({
      saturday,
      sunday,
      destination,
    }));
  } else {
    ({
      destination,
      connectionToDestination,
      connectionFromDestination,
    } = await travelPlanning.planRandomTrip({
      departure: saturday,
      arrival: sunday,
    }));

    ({
      saturdayWeatherForecast,
      sundayWeatherForecast,
    } = await travelPlanning.getWeatherForecast({
      saturday,
      sunday,
      destination,
    }));
  }

  let textToDisplay;
  let textToRead;
  let displayRouteOnMap = null;
  let furtherAction = null;
  let nextLink = null;
  if (weekendFree && destination) {
    textToDisplay = 'Free next weekend\n'
                    + `Destination: ${destination.name} in ${destination.address.city}\n`
                    + `Depart from ${connectionToDestination.legs[0].from}, ${formatDate(connectionToDestination.legs[0].departure)}\n`
                    + `Arrive at ${connectionToDestination.legs[connectionToDestination.legs.length - 1].to},`
                    + `${formatDate(connectionToDestination.legs[connectionToDestination.legs.length - 1].arrival)}\n`
                    + `Price: ${connectionToDestination.price}€ + ${connectionFromDestination.price}€\n\n`

                    + `Return from ${connectionFromDestination.legs[0].from}, ${formatDate(connectionFromDestination.legs[0].departure)}\n`
                    + `Arrive home at ${connectionFromDestination.legs[connectionFromDestination.legs.length - 1].to}, `
                    + `${formatDate(connectionFromDestination.legs[connectionFromDestination.legs.length - 1].arrival)}\n\n`

                    + `Saturday: ${saturdayWeatherForecast.day.shortPhrase} with ${saturdayWeatherForecast.temperature.maximum.value}°C\n`
                    + `Sunday: ${sundayWeatherForecast.day.shortPhrase} with ${sundayWeatherForecast.temperature.maximum.value}°C`;

    textToRead = `You are free next weekend. You could travel to ${destination.name} in `
                  + `${destination.address.city}. Your train leaves from ${connectionToDestination.legs[0].from} at `
                  + `${formatDate(connectionToDestination.legs[0].departure)}. You will arrive at `
                  + `${connectionToDestination.legs[connectionToDestination.legs.length - 1].to} at `
                  + `${formatDate(connectionToDestination.legs[connectionToDestination.legs.length - 1].arrival)}. `
                  + `The total price will be ${connectionToDestination.price + connectionFromDestination.price}€. `
                  + `The weather will be ${saturdayWeatherForecast.day.shortPhrase} with ${saturdayWeatherForecast.temperature.maximum.value}°C`;

    displayRouteOnMap = {
      origin: connectionToDestination.legs[0].from,
      destination: connectionToDestination.legs[connectionToDestination.legs.length - 1].to,
    };
    furtherAction = 'Do you want to get information about how to get to your origin train station?';
    nextLink = `travel-planning/confirm?arrival=${connectionToDestination.legs[0].departure.toISOString()}`;
  } else if (destination) {
    textToDisplay = 'Not free at the weekend.\nCheck back next week!';

    textToRead = 'Unfortunately you are not free at the weekend. '
                  + 'Next week you will get your updated travel plan.';
  } else {
    textToDisplay = 'Could not find travel destination.\nCheck back next week!';

    textToRead = 'Unfortunately I could not find any travel destination for the weekend. '
                  + 'Next week you will get your updated travel plan.';
  }

  res.send({
    textToDisplay,
    textToRead,
    displayRouteOnMap,
    displayPointOnMap: null,
    furtherAction,
    nextLink,
  });
}));

// TODO remeber last request to /
// TODO store destination and don't recommend it again
router.get('/confirm', wrapAsync(async (req, res) => {
  const connection = await travelPlanning.getConnectionToMainStation(req.query.arrival);

  let textToRead;
  let textToDisplay;
  let displayRouteOnMap;
  if (connection) {
    textToDisplay = `Leave home: ${formatDate(connection.departure)}\n`
                    + `First stop: ${connection.legs[0].to}\n`
                    + `Destination: ${connection.legs[connection.legs.length - 1].to}`;
    textToRead = `You have to leave at ${formatDate(connection.departure)}. `
                  + `Your first stop will be ${connection.legs[0].to}. `
                  + `Your destination is ${connection.legs[connection.legs.length - 1].to}`;
    displayRouteOnMap = {
      origin: connection.legs[0].from,
      destination: connection.legs[connection.legs.length - 1].to,
    };
  } else {
    textToDisplay = 'Can not find route to starting point of your travel!\nSorry!';
    textToRead = 'I can not find a route to your travel starting point. Sorry!';
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
