const axios = require('axios').default;
const xml2js = require('xml2js');
const moment = require('moment-timezone');

const endpoint = 'http://efastatic.vvs.de/dhbwstuttgart/trias';

function parseTimedLeg(timedLeg) {
  return {
    mode: 'transport',
    from: timedLeg.LegBoard[0].StopPointName[0].Text[0],
    to: timedLeg.LegAlight[0].StopPointName[0].Text[0],
    departure: timedLeg.LegBoard[0].ServiceDeparture[0].TimetabledTime[0],
    arrival: timedLeg.LegAlight[0].ServiceArrival[0].TimetabledTime[0],
    lineName: timedLeg.Service[0].PublishedLineName[0].Text[0],
    lineDestination: timedLeg.Service[0].DestinationText[0].Text[0],
  };
}

function parseContinuousLeg(continuousLeg) {
  return {
    mode: 'walk',
    from: continuousLeg.LegStart[0].LocationName[0].Text[0],
    to: continuousLeg.LegEnd[0].LocationName[0].Text[0],
  };
}

function parseTripLeg(tripLeg) {
  if (tripLeg.TimedLeg !== undefined) {
    return parseTimedLeg(tripLeg.TimedLeg[0]);
  }

  if (tripLeg.ContinuousLeg !== undefined) {
    return parseContinuousLeg(tripLeg.ContinuousLeg[0]);
  }

  return {};
}

async function parseXML(xml) {
  const object = await xml2js.parseStringPromise(xml, { ignoreAttrs: true });
  const tripResponse = object.Trias.ServiceDelivery[0].DeliveryPayload[0].TripResponse[0];
  if (tripResponse.ErrorMessage !== undefined) {
    const error = tripResponse.ErrorMessage[0].Text[0].Text[0];
    if (error === 'TRIP_NOTRIPFOUND') {
      return undefined;
    }

    throw new Error(`VVS API returned: ${error}`);
  }

  const trip = tripResponse.TripResult[0].Trip[0];
  const departure = trip.StartTime[0];
  const arrival = trip.EndTime[0];
  const duration = moment.duration(moment(arrival).diff(departure));
  const legs = trip.TripLeg.map(parseTripLeg)
    .filter((tripLeg) => Object.keys(tripLeg).length > 0);

  return {
    departure,
    arrival,
    duration: {
      hours: duration.hours(),
      minutes: duration.minutes(),
    },
    legs,
  };
}

function getWaypoint({ coordinates, address, datetime }) {
  let locationRefContent;
  if (coordinates !== undefined) {
    locationRefContent = `<GeoPosition><Latitude>${coordinates.latitude}</Latitude><Longitude>${coordinates.longitude}</Longitude></GeoPosition>`;
  } else {
    locationRefContent = `<AddressRef><AddressCode>Address</AddressCode><AddressName>${address}</AddressName></AddressRef>`;
  }

  if (datetime !== undefined) {
    return `<LocationRef>${locationRefContent}</LocationRef><DepArrTime>${new Date(datetime).toISOString()}</DepArrTime>`;
  }

  return `<LocationRef>${locationRefContent}</LocationRef>`;
}

async function getLastConnection({
  startCoordinates, startAddress, destinationCoordinates, destinationAddress, departure, arrival,
}) {
  const request = `
    <?xml version="1.0" encoding="UTF-8"?>
    <Trias version="1.1" xmlns="http://www.vdv.de/trias" xmlns:siri="http://www.siri.org.uk/siri">
      <ServiceRequest>
        <siri:RequestorRef>${process.env.VVS_KEY}</siri:RequestorRef>
        <RequestPayload>
          <TripRequest>
            <Origin>
              ${getWaypoint({ coordinates: startCoordinates, address: startAddress, datetime: departure })}
            </Origin>
            <Destination>
              ${getWaypoint({ coordinates: destinationCoordinates, address: destinationAddress, datetime: arrival })}
            </Destination>
            <Params>
              <NumberOfResults>1</NumberOfResults>
              <WalkSpeed>100</WalkSpeed>
            </Params>
          </TripRequest>
        </RequestPayload>
      </ServiceRequest>
    </Trias>`;

  const response = await axios.post(endpoint, request, { headers: { 'Content-Type': 'text/xml' } });

  return parseXML(response.data);
}

module.exports = { endpoint, getLastConnection };
