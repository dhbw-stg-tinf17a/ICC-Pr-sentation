const axios = require('axios').default;
const db = require('../modules/db');

jest.mock('axios');

describe('db module', () => {
  describe('getConnections', () => {
    it('should return the requested connections', async () => {
      axios.get.mockResolvedValue({
        data: {
          angebote: {
            0: {
              sel: false, t: 'TCK#1851#1849#0#0#S2#1290#', c: 'S2', p: '12,90', tt: 'SP', zb: 'Y', arq: 'N', ff: 'OLT', aix: '0', sids: ['0'], risids: [], pky: '71851', angnm: '71851', kotxt: '71851', ueid: '1', uepr1: '$2', uepr2: '$2', uepr3: '$2', uentg: '0',
            },
          },
          verbindungen: {
            0: {
              sel: false,
              dir: 'OUTWARD',
              sid: '0',
              dt: '23.03.20',
              dur: '1:35',
              nt: '0',
              NZVerb: false,
              eg: 'ICE',
              trains: [{
                tid: '0.0', lt: 'Transport', ltShort: 'T', s: '8000096', sn: 'Stuttgart Hbf', d: '8000105', dn: 'Frankfurt(Main)Hbf', tn: 'ICE  990', eg: 'ICE', dep: { d: '23.03.20', t: '23:05', m: '1585001100000' }, arr: { d: '24.03.20', t: '00:40', m: '1585006800000' }, pd: '10', pa: '7', rp: false, re: false, sp: false,
              }],
            },
          },
          peTexte: { 71851: { name: 'Super Sparpreis', hinweis: 'You can use all trains and IC Bus services indicated on your ticket. You can use any local train (i.e. RE, RB, S). Passengers on train and IC Bus services with mandatory reservation must reserve a seat. A 3-D Secure Code may be required for credit card payments.<br/>Cancellation (exchange or refund) of your ticket is excluded.' } },
          sbf: [{ nummer: '8000096', name: 'Stuttgart Hbf' }],
          dbf: [{ nummer: '8000105', name: 'Frankfurt(Main)Hbf' }],
          durs: { min: '1:35', max: '1:35' },
          prices: { min: '1290', max: '1290' },
          sp: true,
          device: 'HANDY',
        },
      });

      const parsedConnections = [{
        legs: [{
          mode: 'transport', from: 'Stuttgart Hbf', to: 'Frankfurt(Main)Hbf', departure: new Date('2020-03-23T22:05:00.000Z'), arrival: new Date('2020-03-23T23:40:00.000Z'), trainNumber: 'ICE  990',
        }],
        departure: new Date('2020-03-23T22:05:00.000Z'),
        arrival: new Date('2020-03-23T23:40:00.000Z'),
        duration: { hours: 1, minutes: 35 },
        reducedPrice: true,
        price: 12.9,
        boundToTrain: true,
        notes: { name: 'Super Sparpreis', text: 'You can use all trains and IC Bus services indicated on your ticket. You can use any local train (i.e. RE, RB, S). Passengers on train and IC Bus services with mandatory reservation must reserve a seat. A 3-D Secure Code may be required for credit card payments. Cancellation (exchange or refund) of your ticket is excluded.' },
      }];

      await expect(db.getConnections({ originID: '8000096', destinationID: '8000105', departure: new Date('2020-03-23T22:00:00Z') })).resolves.toStrictEqual(parsedConnections);

      // check conversion to API request (only in this test case)
      expect(axios.get).toHaveBeenLastCalledWith(db.endpoint, { params: { data: '{"s":"8000096","d":"8000105","dt":"23.03.20","t":"23:00","c":2,"ohneICE":false,"tct":0,"dur":86400,"travellers":[{"bc":0,"typ":"E","alter":30}],"sv":true,"device":"HANDY"}', service: 'pscangebotsuche', lang: 'en' } });
    });

    it('should return an empty array if no connections are found', async () => {
      axios.get.mockResolvedValue({
        data: {
          error: {
            s: 'PE', n: '17', t: 'Keine Verbindungen gefunden', tsys: 'keine Verbindung gefunden', zi: '', k: '1',
          },
          sp: false,
          device: 'HANDY',
        },
      });

      await expect(db.getConnections({})).resolves.toStrictEqual([]);
    });

    it('should throw an error if the API returns an error', async () => {
      axios.get.mockResolvedValue({
        data: {
          error: {
            s: 'PE', n: '2', t: 'XML der Anfrage fehlerhaft', tsys: 'Ungueltige XML-Daten gefunden: s=null.', zi: '', k: '2',
          },
          sp: false,
        },
      });
      await expect(db.getConnections({ originID: '8000096', destinationID: '8000105', departure: new Date('2020-03-23T22:00:00Z') })).rejects.toThrow('DB prices API returned: XML der Anfrage fehlerhaft - Ungueltige XML-Daten gefunden: s=null.');
    });

    it('should throw an error if the API returns an error with no tsys property', async () => {
      axios.get.mockResolvedValue({
        data: {
          error: {
            s: 'PE', n: '7', t: 'Nummer des Zielbahnhofs existiert nicht', zi: '', k: '2',
          },
          sp: false,
        },
      });
      await expect(db.getConnections({ originID: '8000096', destinationID: '8000105', departure: new Date('2020-03-23T22:00:00Z') })).rejects.toThrow('DB prices API returned: Nummer des Zielbahnhofs existiert nicht');
    });
  });

  describe('getStationByID', () => {
    it('should return the station with the correct id', async () => {
      await expect(db.getStationByID('8098096')).resolves.toMatchObject({ name: 'Stuttgart Hbf' });
    });

    it('should return null if no station with the given id exists', async () => {
      await expect(db.getStationByID('0')).resolves.toBeNull();
    });
  });

  describe('getFilteredStations', () => {
    it('should return all stations matching the given condition', async () => {
      const filteredStations = await db.getFilteredStations((station) => ['8000105', '8098096'].includes(station.id));
      const filteredStationNames = filteredStations.map((station) => station.name);
      expect(filteredStationNames).toHaveLength(2);
      expect(filteredStationNames).toContain('Stuttgart Hbf');
      expect(filteredStationNames).toContain('Frankfurt (Main) Hbf');
    });
  });
});
