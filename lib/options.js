'use strict';

const Joi = require('joi');

const defaults = {
  enabled: true,
  pruneMethod: 'delete',
  stripNull: false,
  whitelist: false
};

const schema = Joi.object().keys({
  enabled: Joi.boolean().optional(),
  pruneMethod: Joi.string().valid('delete', 'replace').optional(),
  replaceValue: Joi.when('pruneMethod', {
    is: 'replace',
    then: Joi.any(),
    otherwise: Joi.forbidden()
  }),
  stripNull: Joi.boolean().optional(),
  whitelist: Joi.boolean().optional(),
  whitelistValues: Joi.when('whitelist', {
    is: true,
    then: Joi.array().items(Joi.string()).single().optional(),
    otherwise: Joi.forbidden()
  })
});

exports.defaults = defaults;
exports.schema = schema;
