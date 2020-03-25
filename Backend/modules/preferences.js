const initDatabase = require('../utilities/init-database');

const database = initDatabase('preferences', {});

// TODO validation
// TODO explanations

async function get() {
  return (await database).value();
}

async function update(values) {
  await (await database).assign(values).write();
}

module.exports = { get, update };
