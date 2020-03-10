// const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('preferenceModule.json');
const db = low(adapter);

module.exports = db;
