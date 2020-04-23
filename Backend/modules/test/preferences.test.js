/* eslint-disable global-require */

let mockDatabase;
jest.mock('../../utilities/init-database', () => async (name, defaults) => {
  const low = require('lowdb');
  const Memory = require('lowdb/adapters/Memory');
  const adapter = new Memory();
  mockDatabase = low(adapter);
  mockDatabase.defaults(defaults).write();
  return mockDatabase;
});

const joi = require('@hapi/joi');
const preferences = require('../preferences');

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

  describe('getChecked', () => {
    it('should throw an error if preferences are incomplete', async () => {
      const state = { location: { latitude: 0, longitude: 0 } };
      await mockDatabase.setState(state);

      await expect(preferences.getChecked()).rejects.toThrow();
    });

    it('should not throw an error if preferences are complete', async () => {
      const state = { ...preferences.defaults, calendarURL: 'https://example.com', location: { latitude: 0, longitude: 0 } };
      await mockDatabase.setState(state);

      await expect(preferences.getChecked()).resolves.toStrictEqual(state);
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

  describe('defaults', () => {
    it('should be valid', async () => {
      expect(() => joi.assert(preferences.defaults, preferences.schema)).not.toThrow();
    });

    it('should define all keys except location and calendarURL', async () => {
      const schemaKeys = new Set(Object.keys(preferences.rawSchema));
      schemaKeys.delete('calendarURL');
      schemaKeys.delete('location');
      const defaultsKeys = new Set(Object.keys(preferences.defaults));
      expect(defaultsKeys).toStrictEqual(schemaKeys);
    });
  });
});
