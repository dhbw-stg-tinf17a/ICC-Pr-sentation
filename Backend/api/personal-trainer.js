const express = require('express');
const wrapAsync = require('../utilities/wrap-async');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  res.send({});
}));

router.get('/confirm', wrapAsync(async (req, res) => {
  res.send({});
}));

module.exports = router;
