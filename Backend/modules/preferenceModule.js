const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('preferenceModule.json');
const db = low(adapter);

const defaultUser = {
	"name": "Gunter",
	"age": 107,
	"favouriteFood": "Jelly Beans",
	"loyal": true
};

// Set some defaults
db.defaults({ user: defaultUser, global: {},  })
	.write();

module.exports = db;
