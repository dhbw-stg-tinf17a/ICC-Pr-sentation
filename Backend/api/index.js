const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send({
    usecases: [
      { route: '/api/morning-routine', name: 'Morning routine' },
      { route: '/api/personal-trainer', name: 'Personal trainer' },
      { route: '/api/travel-planning', name: 'Travel planning' },
      { route: '/api/lunch-break', name: 'Lunch break' },
    ],
  });
});

router.use('/preferences', require('./preferences'));
router.use('/notifications', require('./notifications'));
router.use('/morning-routine', require('./morning-routine'));
router.use('/personal-trainer', require('./personal-trainer'));
router.use('/travel-planning', require('./travel-planning'));
router.use('/lunch-break', require('./lunch-break'));

module.exports = router;
