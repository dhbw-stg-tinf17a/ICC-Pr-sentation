const joi = require('@hapi/joi');
const initDatabase = require('../utilities/init-database');

const database = initDatabase('preferences', {});

const schema = joi.object({
  location: joi.object({
    latitude: joi.number().min(-90).max(90).required(),
    longitude: joi.number().min(-180).max(180).required(),
  }),
  calendarURL: joi.string().uri({ scheme: ['http', 'https'] }),
});

const description = {
  location: 'Home location',
  calendarURL: 'URL to public ICS calendar feed',
};

async function get() {
  return (await database).value();
}

async function update(values) {
  joi.assert(values, schema);
  await (await database).assign(values).write();
}

module.exports = { get, update, description };
