'use strict';

var Joi = require('joi');
var isWhitespace = require('is-whitespace');
var isString = require('lodash.isstring');
var isPlainObject = require('lodash.isplainobject');
var cloneDeep = require('lodash.clonedeep');

var NULL_CHAR_REGEX = /\0/g;

var schema = Joi.object()
  .keys({
    stripNull: Joi.boolean().optional().default(false),
    pruneMethod: Joi.string().valid('delete', 'replace').required(),
    replaceValue: Joi.when('pruneMethod', {
      is: 'replace',
      then: Joi.any(),
      otherwise: Joi.forbidden()
    })
  })
  .empty({})
  .default({
    pruneMethod: 'delete',
    stripNull: false
  });

function isEmptyOrBlank (str) {
  return str === '' || isWhitespace(str);
}

function stripNullTerminator (str) {
  return str.replace(NULL_CHAR_REGEX, '')
}

function sanitize (obj, options) {
  obj = cloneDeep(obj);

  var keys = Object.getOwnPropertyNames(obj);

  keys.forEach(function (key) {
    var value = obj[key];

    if (isPlainObject(value)) {
      obj[key] = sanitize(value, options);
    } else {
      if (isString(value)) {
        obj[key] = stripNullTerminator(value);
      }

      if ((options.stripNull && value === null) || isEmptyOrBlank(obj[key])) {
        if (options.pruneMethod === 'replace') {
          obj[key] = options.replaceValue;
        } else {
          delete obj[key];
        }
      }
    }
  });

  return obj;
}

exports.register = function (server, options, next) {

  var result = Joi.validate(options, schema);
  if (result.error) {
    return next(result.error);
  }

  options = result.value;

  server.ext('onPostAuth', function (request, reply) {
    if (request.method !== 'get' && isPlainObject(request.payload)) {
      request.payload = sanitize(request.payload, options);
    }

    return reply.continue();
  });

  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
