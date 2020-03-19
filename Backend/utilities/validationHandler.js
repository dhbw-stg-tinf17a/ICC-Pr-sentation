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

validationHandler.validateCoordinate = async (coordinates) => {
  logger.trace('validationHandler - validateCoordinates - with coordinates:');
  logger.trace(coordinates);

  return validate(coordinates, validationSchemas.coordinates);
};

validationHandler.validateCity = async (city) => {
  logger.trace(`validationHandler - validateCity - with city: ${city}`);

  return validate(city, validationSchemas.city);
};


module.exports = validationHandler;
logger.debug('validationHandler initialized');
