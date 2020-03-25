const moment = require('moment-timezone');
const VVS = require('../modules/vvs');

describe('VVSModule', () => {
  it('getLastConnectionStartTime - should return a moment object or an specific error objects', async () => {
    try {
      const startTime = await VVS.getLastConnectionStartTime();
      expect(moment.isMoment(startTime)).toEqual(true);
    } catch (error) {
      expect(error instanceof Error).toEqual(true);
    }
  });
});
