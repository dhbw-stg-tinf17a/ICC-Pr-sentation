const axios = require('axios').default;
const xml2js = require('xml2js');
const moment = require('moment-timezone');

const endpoint = 'http://efastatic.vvs.de/dhbwstuttgart/trias';

function parseTimedLeg(timedLeg) {
  return {
    mode: 'transport',
    from: timedLeg.LegBoard.StopPointName.Text,
    to: timedLeg.LegAlight.StopPointName.Text,
    departure: timedLeg.LegBoard.ServiceDeparture.TimetabledTime,
    arrival: timedLeg.LegAlight.ServiceArrival.TimetabledTime,
    lineName: timedLeg.Service.PublishedLineName.Text,
    lineDestination: timedLeg.Service.DestinationText.Text,
  };
}

function parseContinuousLeg(continuousLeg) {
  return {
    mode: 'walk',
    from: continuousLeg.LegStart.LocationName.Text,
    to: continuousLeg.LegEnd.LocationName.Text,
  };
}

function parseTripLeg(tripLeg) {
  if (tripLeg.TimedLeg) {
    return parseTimedLeg(tripLeg.TimedLeg);
  }

  if (tripLeg.InterchangeLeg) {
    return {};
  }

  if (tripLeg.ContinuousLeg) {
    return parseContinuousLeg(tripLeg.ContinuousLeg);
  }

  throw new Error('Unknown leg type');
}

async function parseXML(xml) {
  const object = await xml2js.parseStringPromise(xml, { explicitArray: false, ignoreAttrs: true });
  const tripResult = object.Trias.ServiceDelivery.DeliveryPayload.TripResponse.TripResult;
  const departure = tripResult.Trip.StartTime;
  const arrival = tripResult.Trip.EndTime;
  const duration = moment.duration(moment(arrival).diff(departure));
  const legs = tripResult.Trip.TripLeg.map(parseTripLeg)
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

async function getLastConnection({ start, destination, arrival }) {
  const request = `<?xml version="1.0" encoding="UTF-8"?>
    <Trias version="1.1" xmlns="http://www.vdv.de/trias" xmlns:siri="http://www.siri.org.uk/siri">
      <ServiceRequest>
        <siri:RequestorRef>${process.env.VVS_KEY}</siri:RequestorRef>
        <RequestPayload>
          <TripRequest>
            <Origin>
              <LocationRef>
                <GeoPosition>
                  <Latitude>${start.latitude}</Latitude>
                  <Longitude>${start.longitude}</Longitude>
                </GeoPosition>
              </LocationRef>
            </Origin>
            <Destination>
              <LocationRef>
                <GeoPosition>
                  <Latitude>${destination.latitude}</Latitude>
                  <Longitude>${destination.longitude}</Longitude>
                </GeoPosition>
              </LocationRef>
              <DepArrTime>${moment(arrival).toISOString()}</DepArrTime>
            </Destination>
            <Params>
              <NumberOfResults>1</NumberOfResults>
              <WalkSpeed>100</WalkSpeed>
            </Params>
          </TripRequest>
        </RequestPayload>
      </ServiceRequest>
    </Trias>`;
  const response = await axios.post(endpoint, request, {
    headers: { 'Content-Type': 'text/xml' },
  });

  return parseXML(response.data);
}

module.exports = { endpoint, getLastConnection };
