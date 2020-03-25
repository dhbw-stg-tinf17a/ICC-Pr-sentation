const express = require('express');
const user = require('../modules/user');
const wrapAsync = require('../utilities/wrap-async');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  res.send({ data: await user.getUser() });
}));

router.put('/coordinates', wrapAsync(async (req, res) => {
  await user.setCoordinates(req.body);
  res.send({});
}));

module.exports = router;
