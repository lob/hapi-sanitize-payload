'use strict';

const Joi = require('joi');

const defaults = {
  enabled: true,
  pruneMethod: 'delete',
  stripNull: false
};

const options = Joi.object().keys({
  pruneMethod: Joi.string().valid('delete', 'replace').optional(),
  replaceValue: Joi.when('pruneMethod', {
    is: 'replace',
    then: Joi.any(),
    otherwise: Joi.forbidden()
  }),
  stripNull: Joi.boolean().optional()
});

const schema = Joi.object().keys({
  enabled: Joi.boolean().optional(),
  // no double quotes or backslashes
  fieldOverride: Joi.object().pattern(/^[^"\\]$/, options).optional()
}).concat(options);

exports.defaults = defaults;
exports.schema = schema;
