const express = require('express');
const wrapAsync = require('../utilities/wrap-async');
const preferences = require('../modules/preferences');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  res.send(await preferences.get());
}));

router.patch('/', wrapAsync(async (req, res) => {
  await preferences.update(req.body);

  res.send({});
}));

module.exports = router;
