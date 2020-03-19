const axios = require('axios').default;
const moment = require('moment');

const options = {
  c: 2, // class
  ohneICE: false, // no ICE trains
  tct: 0, // transfer time
  dur: 1440, // search for routes in the next 60 minutes
  travellers: [{ bc: 0, typ: 'E', alter: 30 }], // one traveller without BahnCard (bc: 0), adult (typ: 'E'), age of 30 (alter: 30)
  sv: true, // prefer fast routes
  device: 'HANDY', // prevent mimimi
};

const endpoint = 'https://ps.bahn.de/preissuche/preissuche/psc_service.go';

module.exports = {
  async getConnections({ start, destination, datetime }) {
    const date = moment(datetime).format('DD.MM.YY');
    const time = moment(datetime).format('HH:mm');

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

    return response.data;
  },
};
