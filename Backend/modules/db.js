const axios = require('axios').default;
const moment = require('moment-timezone');
const dbStations = require('db-stations');

const options = {
  c: 2, // class
  ohneICE: false, // no ICE trains
  tct: 0, // transfer time
  dur: 24 * 60 * 60, // search for routes in the next 24 hours
  travellers: [{ bc: 0, typ: 'E', alter: 30 }], // one traveller without BahnCard (bc: 0), adult (typ: 'E'), age of 30 (alter: 30)
  sv: true, // prefer fast routes
  device: 'HANDY', // prevent mimimi
};

const endpoint = 'https://ps.bahn.de/preissuche/preissuche/psc_service.go';

async function parseData(data) {
  const connections = Object.values(data.verbindungen).map((connection) => {
    const legs = connection.trains.map((leg) => ({
      from: leg.sn,
      to: leg.dn,
      departure: new Date(Number(leg.dep.m)),
      arrival: new Date(Number(leg.arr.m)),
      trainNumber: leg.tn,
    }));

    const { departure } = legs[0];
    const { arrival } = legs[legs.length - 1];
    const duration = moment.duration(moment(arrival).diff(departure));

    return {
      legs,
      departure,
      arrival,
      duration: {
        hours: duration.hours(),
        minutes: duration.minutes(),
      },
    };
  });

  const notes = {};
  Object.entries(data.peTexte).forEach(([ref, note]) => {
    notes[ref] = { name: note.name, text: note.hinweis.replace('<br/>', ' ') };
  });

  Object.values(data.angebote).forEach((offer) => offer.sids.forEach((id) => {
    connections[Number(id)] = {
      ...connections[Number(id)],
      reducedPrice: offer.tt === 'SP',
      price: Number(offer.p.replace(',', '.')),
      boundToTrain: offer.zb === 'Y',
    };

    connections[Number(id)].notes = notes[offer.pky];
  }));

  return connections;
}

async function getConnections({ startID, destinationID, departure }) {
  const date = moment(departure).tz('Europe/Berlin').format('DD.MM.YY');
  const time = moment(departure).tz('Europe/Berlin').format('HH:mm');
  const params = {
    data: JSON.stringify({
      s: startID,
      d: destinationID,
      dt: date,
      t: time,
      ...options,
    }),
    service: 'pscangebotsuche',
  };
  const response = await axios.get(endpoint, { params });

  if (response.data.error !== undefined) {
    if (response.data.error.t === 'Keine Verbindungen gefunden') {
      return [];
    }

    let message = response.data.error.t;
    if (response.data.error.tsys !== undefined) {
      message += ` - ${response.data.error.tsys}`;
    }
    throw new Error(`DB prices API returned: ${message}`);
  }

  return parseData(response.data);
}

function getStationByID(id) {
  return new Promise((resolve) => {
    dbStations()
      .on('data', (station) => {
        if (station.id === id) {
          resolve(station);
        }
      })
      .on('end', () => resolve(null));
  });
}

function getFilteredStations(predicate) {
  const filteredStations = [];

  return new Promise((resolve) => {
    dbStations()
      .on('data', (station) => {
        if (predicate(station)) {
          filteredStations.push(station);
        }
      })
      .on('end', () => resolve(filteredStations));
  });
}

module.exports = {
  getConnections,
  getStationByID,
  getFilteredStations,
  endpoint,
};
