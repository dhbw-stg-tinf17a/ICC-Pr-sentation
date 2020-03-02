require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const pino = require('pino');
const helmet = require('helmet');

const app = express();

// Initialize Pino-logging
const logger = pino({ level: process.env.LOG_LEVEL || 'info', redact: { paths: ['password'], censor: '**GDPR COMPLIANT**' } });

// Initialize cors
const corsOptions = {
	origin: 'http://localhost:4200',
	credentials: true
};
logger.info("Running in production: " + process.env.PROD);
if (process.env.PROD == "true") corsOptions.origin = process.env.PROD_URL;
app.use(cors(corsOptions));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use(require('./routes'));

module.exports = app;
