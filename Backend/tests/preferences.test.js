/* eslint-disable global-require */

let mockDatabase;
jest.mock('../utilities/init-database', () => async (name, defaults) => {
  const low = require('lowdb');
  const Memory = require('lowdb/adapters/Memory');
  const adapter = new Memory();
  mockDatabase = low(adapter);
  mockDatabase.defaults(defaults).write();
  return mockDatabase;
});

const preferences = require('../modules/preferences');

describe('preferences module', () => {
  beforeEach(async () => {
    await mockDatabase.setState({ });
  });

  describe('get', () => {
    it('should return all preferences', async () => {
      const state = { location: { latitude: 0, longitude: 0 } };
      await mockDatabase.setState(state);

      await expect(preferences.get()).resolves.toStrictEqual(state);
    });
  });

  describe('update', () => {
    it('should update the preferences', async () => {
      const state = { location: { latitude: 0, longitude: 0 } };
      await mockDatabase.setState(state);

      const update = { calendarURL: 'https://example.com' };
      await preferences.update(update);

      await expect(mockDatabase.getState()).toStrictEqual({ ...state, ...update });
    });

    it('should reject invalid values', async () => {
      // longitude missing
      expect(preferences.update({ location: { latitude: 0 } })).rejects.toThrow();

      // invalid latitude
      expect(preferences.update({ location: { latitude: -91, longitude: 0 } })).rejects.toThrow();

      // invalid calendar URL
      expect(preferences.update({ calendarURL: 'blubb' })).rejects.toThrow();
    });

    it('should accept valid values', async () => {
      expect(preferences.update({ location: { latitude: 0, longitude: 0 } })).resolves
        .toBeUndefined();
      expect(preferences.update({ calendarURL: 'https://example.com' })).resolves.toBeUndefined();
    });
  });
});