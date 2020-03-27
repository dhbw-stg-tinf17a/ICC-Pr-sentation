const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const lunchBreak = require('../usecases/lunch-break');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  // TODO
  res.send({});
}));

module.exports = router;
