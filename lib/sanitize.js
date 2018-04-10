'use strict';

const CloneDeep     = require('lodash.clonedeep');
const Includes      = require('lodash.includes');
const IsPlainObject = require('lodash.isplainobject');
const IsString      = require('lodash.isstring');
const Omit          = require('lodash.omit');
const Unset         = require('lodash.unset');

const NULL_CHAR_REGEX    = /\0/g;
const BLANK_STRING_REGEX = /^\s*$/;

function isBlank (string) {
  return IsString(string) && BLANK_STRING_REGEX.test(string);
}

function stripNullTerminator (string) {
  return string.replace(NULL_CHAR_REGEX, '');
}

function Sanitize (object, options) {
  if (!IsPlainObject(object)) {
    return object;
  }

  object = CloneDeep(object);
  options = options || {};

  Object.keys(object).forEach((key) => {
    if (!options.whitelist || options.whitelist && Includes(options.whitelistValues, key)) {
      let value = object[key];

      if (IsPlainObject(value)) {
        const newOptions = Omit(CloneDeep(options), ['whitelist', 'whitelistValues']);
        object[key] = Sanitize(value, newOptions);
      } else {
        if (IsString(value)) {
          object[key] = value = stripNullTerminator(value).trim();
        }

        if (options.stripNull && value === null || isBlank(value)) {
          if (options.pruneMethod === 'replace') {
            object[key] = options.replaceValue;
          } else {
            Unset(object, key);
          }
        }
      }
    }
  });
  return object;
}

module.exports = Sanitize;
