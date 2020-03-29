require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

require('./usecases');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use('/api', require('./api'));

module.exports = app;
