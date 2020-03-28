const axios = require('axios').default;
const xml2js = require('xml2js');
const vvs = require('../modules/vvs');

jest.mock('axios');

process.env.VVS_KEY = 'VVS_KEY';

describe('vvs module', () => {
  describe('getLastConnection', () => {
    it('should return a connection from given coordinates to a given address', async () => {
      const request = { Trias: { ServiceRequest: [{ 'siri:RequestorRef': [process.env.VVS_KEY], RequestPayload: [{ TripRequest: [{ Origin: [{ LocationRef: [{ GeoPosition: [{ Latitude: ['48.77355689485371'], Longitude: ['9.17095497616363'] }] }] }], Destination: [{ LocationRef: [{ AddressRef: [{ AddressCode: ['Address'], AddressName: ['Neckartalstraße, 70376 Stuttgart, Germany'] }] }], DepArrTime: ['2020-03-23T22:00:00.000Z'] }], Params: [{ NumberOfResults: ['1'], WalkSpeed: ['100'] }] }] }] }] } };
      const response = '<?xml version="1.0" encoding="UTF-8"?><Trias xmlns="http://www.vdv.de/trias" version="1.1"><ServiceDelivery><ResponseTimestamp xmlns="http://www.siri.org.uk/siri">2020-03-27T12:59:42Z</ResponseTimestamp><ProducerRef xmlns="http://www.siri.org.uk/siri">EFAController10.3.8.21-EFA-STATIC04</ProducerRef><Status xmlns="http://www.siri.org.uk/siri">true</Status><MoreData>false</MoreData><Language>de</Language><DeliveryPayload><TripResponse><TripResponseContext><Situations><PtSituation><CreationTime xmlns="http://www.siri.org.uk/siri">2019-01-18T09:26:00Z</CreationTime><ParticipantRef xmlns="http://www.siri.org.uk/siri">SSB</ParticipantRef><SituationNumber xmlns="http://www.siri.org.uk/siri">25468</SituationNumber><Version xmlns="http://www.siri.org.uk/siri">3</Version><Source xmlns="http://www.siri.org.uk/siri"><SourceType>other</SourceType></Source><Progress xmlns="http://www.siri.org.uk/siri">open</Progress><ValidityPeriod xmlns="http://www.siri.org.uk/siri"><StartTime>2018-10-12T04:00:00Z</StartTime><EndTime>2500-12-30T23:00:00Z</EndTime></ValidityPeriod><UnknownReason xmlns="http://www.siri.org.uk/siri">unknown</UnknownReason><Priority xmlns="http://www.siri.org.uk/siri">3</Priority><Audience xmlns="http://www.siri.org.uk/siri">public</Audience><ScopeType xmlns="http://www.siri.org.uk/siri">line</ScopeType><Planned xmlns="http://www.siri.org.uk/siri">false</Planned><Language xmlns="http://www.siri.org.uk/siri"></Language><Summary xmlns="http://www.siri.org.uk/siri" overridden="true">Stuttgart-Mitte: Haltepunkte an der Haltestelle Börsenplatz verlegt</Summary><Description xmlns="http://www.siri.org.uk/siri" overridden="true">Linien U11, U14, U29</Description><Detail xmlns="http://www.siri.org.uk/siri" overridden="true">Die Haltepositionen der Stadtbahnen werden ab Freitag, 12. Oktober 2018 bis auf weiteres verschoben. Grund dafür sind Bauarbeiten am Bahnsteig. Die Bahnen halten in den hinteren Bereichen der Haltestelle, die nicht von den Umbaumaßnahmen betroffen sind. Die beschriebenen Fahrplanänderungen sind &lt;b&gt;nicht in EFA&lt;/b&gt; erfasst.</Detail></PtSituation></Situations></TripResponseContext><TripResult><ResultId>ID-3C62F883-9675-4FAD-BFBF-15F8397716F8</ResultId><Trip><TripId>ID-E667C611-B5A3-4B95-BCB1-56486F0B7562</TripId><Duration>PT23M</Duration><StartTime>2020-03-23T21:29:00Z</StartTime><EndTime>2020-03-23T21:52:00Z</EndTime><Interchanges>0</Interchanges><TripLeg><LegId>1</LegId><ContinuousLeg><LegStart><StopPointRef>99999997</StopPointRef><LocationName><Text>Altstadt (Stuttgart), Rotebühlplatz 41</Text><Language>de</Language></LocationName></LegStart><LegEnd><StopPointRef>de:08111:6056</StopPointRef><LocationName><Text>Stadtmitte</Text><Language>de</Language></LocationName></LegEnd><Service><IndividualMode>walk</IndividualMode></Service><TimeWindowStart>2020-03-23T21:29:00Z</TimeWindowStart><TimeWindowEnd>2020-03-23T21:33:00Z</TimeWindowEnd><Duration>PT4M</Duration><Length>240</Length></ContinuousLeg></TripLeg><TripLeg><LegId>2</LegId><InterchangeLeg><InterchangeMode>walk</InterchangeMode><LegStart><StopPointRef>de:08111:6056</StopPointRef><LocationName><Text>Stadtmitte</Text><Language>de</Language></LocationName></LegStart><LegEnd><StopPointRef>de:08111:6056:2:1</StopPointRef><LocationName><Text>Stadtmitte</Text><Language>de</Language></LocationName></LegEnd><TimeWindowStart>2020-03-23T21:33:00Z</TimeWindowStart><TimeWindowEnd>2020-03-23T21:35:00Z</TimeWindowEnd><Duration>PT2M</Duration><WalkDuration>PT2M</WalkDuration><BufferTime>PT0M</BufferTime></InterchangeLeg></TripLeg><TripLeg><LegId>3</LegId><TimedLeg><LegBoard><StopPointRef>de:08111:6056</StopPointRef><StopPointName><Text>Rotebühlplatz</Text><Language>de</Language></StopPointName><ServiceDeparture><TimetabledTime>2020-03-23T21:35:00Z</TimetabledTime></ServiceDeparture><StopSeqNumber>1</StopSeqNumber></LegBoard><LegAlight><StopPointRef>de:08111:254</StopPointRef><StopPointName><Text>Wilhelma</Text><Language>de</Language></StopPointName><ServiceArrival><TimetabledTime>2020-03-23T21:47:00Z</TimetabledTime></ServiceArrival><StopSeqNumber>9</StopSeqNumber></LegAlight><Service><OperatingDayRef>2020-03-23T</OperatingDayRef><JourneyRef>vvs:20014::R:j20:332</JourneyRef><LineRef>vvs:20014::R</LineRef><DirectionRef>return</DirectionRef><Mode><PtMode>metro</PtMode><MetroSubmode>urbanRailway</MetroSubmode><Name><Text>Stadtbahn</Text><Language>de</Language></Name></Mode><PublishedLineName><Text>U14</Text><Language>de</Language></PublishedLineName><OperatorRef>vvs:01</OperatorRef><RouteDescription><Text>Hauptbahnhof - Rotebühlpl. - Charlottenpl. - Mühlhausen</Text><Language>de</Language></RouteDescription><OriginText><Text></Text><Language>de</Language></OriginText><DestinationStopPointRef>de:08111:6270</DestinationStopPointRef><DestinationText><Text>Mühlhausen (Stgt.)</Text><Language>de</Language></DestinationText><SituationFullRef><ParticipantRef xmlns="http://www.siri.org.uk/siri">SSB</ParticipantRef><SituationNumber xmlns="http://www.siri.org.uk/siri">25468</SituationNumber></SituationFullRef></Service></TimedLeg></TripLeg><TripLeg><LegId>4</LegId><InterchangeLeg><InterchangeMode>walk</InterchangeMode><LegStart><StopPointRef>de:08111:254:1:2</StopPointRef><LocationName><Text>Wilhelma</Text><Language>de</Language></LocationName></LegStart><LegEnd><StopPointRef>de:08111:254</StopPointRef><LocationName><Text>Wilhelma</Text><Language>de</Language></LocationName></LegEnd><TimeWindowStart>2020-03-23T21:49:00Z</TimeWindowStart><TimeWindowEnd>2020-03-23T21:50:00Z</TimeWindowEnd><Duration>PT1M</Duration><WalkDuration>PT0M</WalkDuration><BufferTime>PT1M</BufferTime></InterchangeLeg></TripLeg><TripLeg><LegId>5</LegId><ContinuousLeg><LegStart><StopPointRef>de:08111:254</StopPointRef><LocationName><Text>Wilhelma</Text><Language>de</Language></LocationName></LegStart><LegEnd><StopPointRef>99999998</StopPointRef><LocationName><Text>Stuttgart, Neckartalstraße</Text><Language>de</Language></LocationName></LegEnd><Service><IndividualMode>walk</IndividualMode></Service><TimeWindowStart>2020-03-23T21:50:00Z</TimeWindowStart><TimeWindowEnd>2020-03-23T21:52:00Z</TimeWindowEnd><Duration>PT2M</Duration><Length>107</Length></ContinuousLeg></TripLeg></Trip></TripResult></TripResponse></DeliveryPayload></ServiceDelivery></Trias>';
      const connection = {
        departure: '2020-03-23T21:29:00Z',
        arrival: '2020-03-23T21:52:00Z',
        duration: { hours: 0, minutes: 23 },
        legs: [
          { mode: 'walk', from: 'Altstadt (Stuttgart), Rotebühlplatz 41', to: 'Stadtmitte' },
          {
            mode: 'transport', from: 'Rotebühlplatz', to: 'Wilhelma', departure: '2020-03-23T21:35:00Z', arrival: '2020-03-23T21:47:00Z', lineName: 'U14', lineDestination: 'Mühlhausen (Stgt.)',
          },
          { mode: 'walk', from: 'Wilhelma', to: 'Stuttgart, Neckartalstraße' },
        ],
      };

      axios.post.mockResolvedValue({ data: response });

      await expect(vvs.getLastConnection({ originCoordinates: { latitude: 48.77355689485371, longitude: 9.17095497616363 }, destinationAddress: 'Neckartalstraße, 70376 Stuttgart, Germany', arrival: '2020-03-23T22:00:00Z' })).resolves.toStrictEqual(connection);

      // check conversion to API request (only in this test case)
      expect(axios.post).toHaveBeenLastCalledWith(vvs.endpoint, expect.any(String), { headers: { 'Content-Type': 'text/xml' } });
      await expect(xml2js.parseStringPromise(axios.post.mock.calls[0][1], { ignoreAttrs: true }))
        .resolves.toStrictEqual(request);
    });

    it('should return undefined if no connection is found', async () => {
      const response = '<?xml version="1.0" encoding="UTF-8"?><Trias xmlns="http://www.vdv.de/trias" version="1.1"><ServiceDelivery><ResponseTimestamp xmlns="http://www.siri.org.uk/siri">2020-03-27T12:59:42Z</ResponseTimestamp><ProducerRef xmlns="http://www.siri.org.uk/siri">EFAController10.3.8.21-EFA-STATIC04</ProducerRef><Status xmlns="http://www.siri.org.uk/siri">true</Status><MoreData>false</MoreData><Language>de</Language><DeliveryPayload><TripResponse><ErrorMessage><Code>-4000</Code><Text><Text>TRIP_NOTRIPFOUND</Text><Language>de</Language></Text></ErrorMessage></TripResponse></DeliveryPayload></ServiceDelivery></Trias>';

      axios.post.mockResolvedValue({ data: response });

      await expect(vvs.getLastConnection({ originCoordinates: { latitude: 48.77355689485371, longitude: 9.17095497616363 }, destinationAddress: 'Schlumpfhausen', arrival: '2020-03-23T22:00:00Z' })).resolves.toBeUndefined();
    });

    it('should throw an error if the API returns an error', async () => {
      const response = '<?xml version="1.0" encoding="UTF-8"?><Trias xmlns="http://www.vdv.de/trias" version="1.1"><ServiceDelivery><ResponseTimestamp xmlns="http://www.siri.org.uk/siri">2020-03-27T12:59:42Z</ResponseTimestamp><ProducerRef xmlns="http://www.siri.org.uk/siri">EFAController10.3.8.21-EFA-STATIC04</ProducerRef><Status xmlns="http://www.siri.org.uk/siri">true</Status><MoreData>false</MoreData><Language>de</Language><DeliveryPayload><TripResponse><ErrorMessage><Code>-1213</Code><Text><Text>DROELFISNOTANUMBER</Text><Language>de</Language></Text></ErrorMessage></TripResponse></DeliveryPayload></ServiceDelivery></Trias>';

      axios.post.mockResolvedValue({ data: response });

      await expect(vvs.getLastConnection({ originCoordinates: { latitude: 48.77355689485371, longitude: 9.17095497616363 }, destinationAddress: 'Schlumpfhausen II', arrival: '2020-03-23T22:00:00Z' })).rejects.toThrow('VVS API returned: DROELFISNOTANUMBER');
    });
  });
});
