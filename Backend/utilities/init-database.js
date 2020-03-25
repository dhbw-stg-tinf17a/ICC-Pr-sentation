const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

async function init(name, defaults) {
  const adapter = new FileAsync(`database/${name}.json`);
  const database = await low(adapter);
  await database.defaults(defaults).write();
  return database;
}

module.exports = init;
