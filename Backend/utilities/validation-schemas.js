const joi = require('@hapi/joi');

const latitude = joi.string().regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/).required();
const longitude = joi.string().regex(/^\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/).required();

module.exports = {
  coordinates: joi.object().keys({
    lat: latitude,
    lon: longitude,
  }).label('coordinates'),
};
