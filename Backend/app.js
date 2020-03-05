require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const pino = require('pino');
const helmet = require('helmet');

const app = express();

// Initialize Pino-logging
const logger = pino({ level: process.env.LOG_LEVEL || 'info', redact: { paths: ['password'], censor: '**GDPR COMPLIANT**' } });

const prod = process.env.PROD == 'true';
logger.info(`Running in ${prod ? 'production' : 'development'}`);

// Initialize cors
app.use(cors({
	origin: prod ? process.env.PROD_URL : 'http://localhost:4200',
	credentials: true
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/api', require('./routes'));
require('./modules/alarm');
module.exports = app;
