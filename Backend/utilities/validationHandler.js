const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const validationSchemas = require('./validationSchemas');

const validationHandler = {};

function validate(object, schema) {
  return new Promise((resolve, reject) => {
    schema.validateAsync(object)
      .then((result) => resolve(result))
      .catch((error) => reject(new Error(error.details[0].message)))
      .finally(() => logger.trace('ValidationHandler - validate - finally'));
  });
}

validationHandler.validateCoordinate = (coordinates) => new Promise((resolve, reject) => {
  logger.trace('validationHandler - validateCoordinates - with coordinates:');
  logger.trace(coordinates);

  validate(coordinates, validationSchemas.coordinates)
    .then((validatedCoordinates) => resolve(validatedCoordinates))
    .catch((error) => reject(new Error(error.message)))
    .finally(() => logger.trace('validationHandler - validateCoordinates - finally'));
});


module.exports = validationHandler;
logger.debug('validationHandler initialized');
