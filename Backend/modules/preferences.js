const joi = require('@hapi/joi');
const initDatabase = require('../utilities/init-database');

const database = initDatabase('preferences', {
  lunchBreakStart: { hour: 11, minute: 0 },
  lunchBreakEnd: { hour: 14, minute: 0 },
  lunchBreakRequiredMinutes: 60,
  lunchBreakMaxDistance: 1,
  lunchBreakMinutesBeforeStart: 30,

  morningRoutineMinutesForPreparation: 45,
  mornginRoutineQuoteCategory: 'funny',

  personalTrainerStart: { hour: 15, minute: 0 },
  personalTrainerEnd: { hour: 22, minute: 0 },
  personalTraierRequiredMinutes: 60,
  personalTrainerMaxDistance: 1,
  personalTrainerMinutesBeforeStart: 30,

  travelPlanningMinDistance: 100,
});

const timeSchema = joi.object({
  hour: joi.number().min(0).max(23).required(),
  minute: joi.number().min(0).max(59).required(),
});
const nonNegativeNumber = joi.number().min(0);
const schema = joi.object({
  location: joi.object({
    latitude: joi.number().min(-90).max(90).required(),
    longitude: joi.number().min(-180).max(180).required(),
  }),
  calendarURL: joi.string().uri({ scheme: ['http', 'https'] }),

  lunchBreakStart: timeSchema,
  lunchBreakEnd: timeSchema,
  lunchBreakRequiredMinutes: nonNegativeNumber,
  lunchBreakMaxDistance: nonNegativeNumber,
  lunchBreakMinutesBeforeStart: nonNegativeNumber,

  morningRoutineMinutesForPreparation: nonNegativeNumber,
  mornginRoutineQuoteCategory: joi.string().valid('inspire', 'management', 'sports', 'life', 'funny', 'love', 'art', 'students'),

  personalTrainerStart: timeSchema,
  personalTrainerEnd: timeSchema,
  personalTraierRequiredMinutes: nonNegativeNumber,
  personalTrainerMaxDistance: nonNegativeNumber,
  personalTrainerMinutesBeforeStart: nonNegativeNumber,

  travelPlanningMinDistance: nonNegativeNumber,
});

async function get() {
  return (await database).value();
}

async function update(values) {
  joi.assert(values, schema);
  await (await database).assign(values).write();
}

module.exports = { get, update };
