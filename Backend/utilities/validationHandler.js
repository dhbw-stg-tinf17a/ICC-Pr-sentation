const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const validationHandler = {};
const validationSchemas = require('./validationSchemas');

function validate(object, schema) {
	return new Promise((resolve, reject) => {
		schema.validateAsync(object)
			.then((result) => resolve(result))
			.catch((error) => reject( new Error(error.details[0].message)))
			.finally(() => logger.trace('ValidationHandler - validate - finally'));
	});
}

validationHandler.validateCoordinate = function (coordinates) {
	return new Promise((resolve, reject) => {
		logger.trace('validationHandler - validateCoordinates - with coordinates:');
		logger.trace(coordinates);

		validate(coordinates, validationSchemas.coordinates)
			.then((coordinates) => resolve(coordinates))
			.catch((error) => reject( new Error(error.message)))
			.finally(() => logger.trace("validationHandler - validateCoordinates - finally"));
	});
};




module.exports = validationHandler;
logger.debug("validationHandler initialized");