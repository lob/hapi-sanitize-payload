'use strict';

var isWhitespace = require('is-whitespace');
var isString = require('lodash.isstring');
var isPlainObject = require('lodash.isplainobject');
var cloneDeep = require('lodash.clonedeep');

var NULL_CHAR_REGEX = /\0/g;

function isEmptyOrBlank (str) {
  return str === '' || isWhitespace(str);
};

function stripNullTerminator (str) {
  return str.replace(NULL_CHAR_REGEX, '')
};

function sanitize (obj) {
  obj = cloneDeep(obj);

  var keys = Object.getOwnPropertyNames(obj);

  keys.forEach(function (key) {
    var value = obj[key];

    if (isPlainObject(value)) {
      obj[key] = sanitize(value);
    } else if (isString(value)) {
      obj[key] = stripNullTerminator(value);

      if (isEmptyOrBlank(obj[key])) {
        delete obj[key];
      }
    }
  });

  return obj;
};

exports.register = function (server, options, next) {

  server.ext('onPostAuth', function (request, reply) {
    if (request.method !== 'get' && isPlainObject(request.payload)) {
      request.payload = sanitize(request.payload);
    }

    return reply.continue();
  });

  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
