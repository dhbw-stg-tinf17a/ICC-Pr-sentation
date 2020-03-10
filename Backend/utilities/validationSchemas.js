const JOI = require('@hapi/joi');

const latitude = JOI.string().regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/).required();
const longitude = JOI.string().regex(/^\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/).required();

module.exports = {
	coordinates: JOI.object().keys({
		lat: latitude,
		lon: longitude
	}).label('coordinates'),
};