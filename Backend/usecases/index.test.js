/* eslint-disable global-require */
const lunchBreak = require('./lunch-break');
const morningRoutine = require('./morning-routine');
const travelPlanning = require('./travel-planning');
const personalTrainer = require('./personal-trainer');

jest.mock('./travel-planning');
jest.mock('./morning-routine');
jest.mock('./lunch-break');
jest.mock('./personal-trainer');

describe('usecases initialization', () => {
  it('should initialize every usecase', () => {
    require('./index');

    expect(lunchBreak.init).toHaveBeenCalledTimes(1);
    expect(morningRoutine.init).toHaveBeenCalledTimes(1);
    expect(travelPlanning.init).toHaveBeenCalledTimes(1);
    expect(personalTrainer.init).toHaveBeenCalledTimes(1);
  });
});
