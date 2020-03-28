const express = require('express');

const router = express.Router();

router.use('/preferences', require('./preferences'));
router.use('/notifications', require('./notifications'));
router.use('/morning-routine', require('./morning-routine'));
// TODO personal trainer usecase
router.use('/travel-planning', require('./travel-planning'));
router.use('/lunch-break', require('./lunch-break'));

module.exports = router;
