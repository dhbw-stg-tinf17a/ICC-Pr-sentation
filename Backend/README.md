# This is Gunter's backend.

Before running it with `npm start`, you should run `npm install` and copy the /templates/dot.env file into /.env

Developers start it with `npm run start-dev`.

### Node iCal for Accessing Google Calendar API
The format of an event-object is shown in /templates/

### Quote of the day
available quote categories: `inspire`, `management`, `life`, `sports`, `funny`, `love`, `art`, `students`
-> There is a ratelimit of 10 requests per hour
The format of a quote-event is shown in /templates/

### Current weather at preferred location
We use the OpenWeatherMap.org API for this.
The format of a weather-object is shown in /templates/.

### VVS API
Parameters:
 * Response as JSON: `?outputFormat=json`
 * Language: `?language=en`
 * Date: `?itdDate=YYYYMMDD`
 * Time:
    * Hour and Minute: `?itdTime=HHMM`
    * Offset from current time: `?timeOffset=MM`
    * Time is AM or PM: `?itdTimeAMPM=am|pm`
    * Departure or Arrival time: `?itdTripDateTimeDepArr=arr`
 * Verify locations:
    * activate locationServer: `?locationServerActive=1`
    * origin/destination-Type: `?type_origin=stopID|poiID|coord|any` and `?type_destination=`
    * origin/destination identification: `?name_origin=Kursaal,%20Stuttgart` or `?name_destination=48.809062,9.219187`
 * How many routes should be returned: `?calcNumberOfTrips=1`
 * Include nearby stops: `?useProxFootSearch=1`
    * more specific: `?useProxFootSearchOrig=1` or `?useProxFootSearchDest=1`
 * Maximum changes: `?maxChanges=0|1|2|9`
 * Route type: `?routeType=LEASTTIME|LEASTINTERCHANGE|LEASTWALKING`
 * exclude means of transport: `?excludedMeans=<ID>`
 * change walking speed: `?changeSpeed=normal|slow|fast`

Costs:
| Service           | Price in $ per 1k requests |
|-------------------|----------------------------|
| Place-Details     | 20                         |
| Reverse Geocoding | 5                          |
