const axios = require('axios').default;
const moment = require('moment');
const stations = require('db-stations');

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

async function getConnections({ start, destination, datetime }) {
  const date = moment(datetime).tz('Europe/Berlin').format('DD.MM.YY');
  const time = moment(datetime).tz('Europe/Berlin').format('HH:mm');

  const params = {
    data: JSON.stringify({
      s: start,
      d: destination,
      dt: date,
      t: time,
      ...options,
    }),
    service: 'pscangebotsuche',
  };

  const response = await axios.get(endpoint, { params });

  if (response.status !== 200) {
    throw new Error(`Unexpected response from DB prices API: ${response.status} - ${response.statusText}`);
  }

  if (response.data.error) {
    throw new Error(`Error returned by DB prices API: ${response.data.error.t} - ${response.data.error.tsys}`);
  }

  const connections = Object.values(response.data.verbindungen).map((connection) => {
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
  Object.entries(response.data.peTexte).forEach(([ref, note]) => {
    notes[ref] = { name: note.name, text: note.hinweis.replace('<br/>', ' ') };
  });

  Object.values(response.data.angebote).forEach((offer) => offer.sids.forEach((id) => {
    connections[Number(id)] = {
      ...connections[Number(id)],
      reducedPrice: offer.tt === 'SP',
      price: Number(offer.p.replace(',', '.')),
      boundToTrain: offer.zb === 'Y',
    };

    if (offer.pky in notes) {
      connections[Number(id)].notes = notes[offer.pky];
    }
  }));


  return connections;
}

function getStationByName(name) {
  return new Promise((resolve) => {
    stations()
      .on('data', (station) => {
        if (station.name === name) {
          resolve(station);
        }
      })
      .on('end', () => resolve(null));
  });
}

function getStationByID(id) {
  return new Promise((resolve) => {
    stations()
      .on('data', (station) => {
        if (station.id === id) {
          resolve(station);
        }
      })
      .on('end', () => resolve(null));
  });
}

module.exports = {
  getConnections,
  getStationByName,
  getStationByID,
};
