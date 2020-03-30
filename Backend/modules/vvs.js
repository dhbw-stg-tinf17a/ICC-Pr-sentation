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
    mode: 'walking',
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

async function parseTripResponse(response) {
  const tripResponse = response.TripResponse[0];
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

async function getResponse(requestPayload) {
  const request = `
    <Trias version="1.1" xmlns="http://www.vdv.de/trias" xmlns:siri="http://www.siri.org.uk/siri">
      <ServiceRequest>
        <siri:RequestorRef>${process.env.VVS_KEY}</siri:RequestorRef>
        <RequestPayload>${requestPayload}</RequestPayload>
      </ServiceRequest>
    </Trias>`;

  const response = await axios.post(endpoint, request, { headers: { 'Content-Type': 'text/xml' } });

  const object = await xml2js.parseStringPromise(response.data, { ignoreAttrs: true });
  return object.Trias.ServiceDelivery[0].DeliveryPayload[0];
}

async function getAddressCode(address) {
  const response = await getResponse(`
    <LocationInformationRequest>
      <InitialInput>
        <LocationName>${address}</LocationName>
      </InitialInput>
    </LocationInformationRequest>`);

  return response.LocationInformationResponse[0].Location[0].Location[0].Address[0].AddressCode[0];
}

async function getWaypoint({
  coordinates, address, stop, datetime,
}) {
  let locationRefContent;
  if (coordinates !== undefined) {
    locationRefContent = `
      <GeoPosition>
        <Latitude>${coordinates.latitude}</Latitude>
        <Longitude>${coordinates.longitude}</Longitude>
      </GeoPosition>`;
  } else if (stop !== undefined) {
    locationRefContent = `<StopPointRef>${stop}</StopPointRef>`;
  } else {
    // TODO maybe convert address to coordinates using Azure Maps instead - would be faster
    const addressCode = await getAddressCode(address);
    locationRefContent = `<AddressRef>${addressCode}</AddressRef>`;
  }

  let waypoint = `<LocationRef>${locationRefContent}</LocationRef>`;
  if (datetime !== undefined) {
    waypoint += `<DepArrTime>${new Date(datetime).toISOString()}</DepArrTime>`;
  }

  return waypoint;
}

async function getConnection({
  originCoordinates, originAddress, originStop, destinationCoordinates, destinationAddress,
  destinationStop, departure, arrival,
}) {
  const [origin, destination] = await Promise.all([
    getWaypoint({
      coordinates: originCoordinates,
      address: originAddress,
      stop: originStop,
      datetime: departure,
    }),
    getWaypoint({
      coordinates: destinationCoordinates,
      address: destinationAddress,
      stop: destinationStop,
      datetime: arrival,
    }),
  ]);
  const response = await getResponse(`
    <TripRequest>
      <Origin>${origin}</Origin>
      <Destination>${destination}</Destination>
      <Params>
        <NumberOfResults>1</NumberOfResults>
        <WalkSpeed>100</WalkSpeed>
      </Params>
    </TripRequest>`);

  return parseTripResponse(response);
}

module.exports = { endpoint, getConnection };
