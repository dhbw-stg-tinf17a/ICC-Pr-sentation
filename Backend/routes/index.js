const router = require('express').Router();
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });


router.use('/', (req, res, next) => {
  logger.info(`router - called route: ${req.originalUrl}`);
  next();
});

router.get('/', (req, res) => {
  logger.trace('router - index - GET called on /');
  const welcomeMessage = 'Welcome to Gunter\'s heart - I am the backend.Feel free to leave, since you should let the frontend talk to me.';
  res.status(200).send({ data: welcomeMessage });
});

router.use('/user', require('./user'));
router.use('/quote', require('./quote'));
router.use('/weather', require('./weather'));
router.use('/notifications', require('./notifications'));
router.use('/places', require('./place'));
router.use('/db', require('./db'));
router.use('/usecases', require('./usecase'));

router.use('/travel-planning', require('./travel-planning'));

router.get('*', (req, res) => {
  res.status(404).send({ error: 'Route not found' });
});

module.exports = router;
