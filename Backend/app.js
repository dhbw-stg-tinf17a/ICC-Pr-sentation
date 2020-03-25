require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const pino = require('pino');

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const prod = process.env.PROD === 'true';
logger.info(`Running in ${prod ? 'production' : 'development'}`);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', require('./api'));

module.exports = app;
