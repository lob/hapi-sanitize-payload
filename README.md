# hapi-sanitize-payload [![npm version](https://badge.fury.io/js/hapi-sanitize-payload.svg)](http://badge.fury.io/js/hapi-sanitize-payload) [![Build Status](https://travis-ci.org/lob/hapi-sanitize-payload.svg)](https://travis-ci.org/lob/hapi-sanitize-payload)

A plugin to recursively sanitize or prune values in a `request.payload` object.

Currently uses the following rules:

- Removes null characters (ie. `\0`) from string values
- Deletes from the payload keys with a value of empty string (ie. `''`), or optionally replaces them with a different value
- Deletes from the payload keys with a value consisting entirely of whitespace (ie. `' \t\n '`), or optionally replaces them with a different value

## Registering the plugin

```js
var Hapi = require('hapi');

var server = new Hapi.Server();

server.register([
  { register: require('hapi-sanitize-payload'), options: { pruneMethod: 'delete' } }
], function (err) {
  // Insert your preferred error handling here...
});
```

## Options

- `pruneMethod` - the method the sanitizer uses when a value that is to be pruned is encountered. The value must be one of:
  - `'delete'` - the key will be removed from the payload entirely (ie. `{ a: '', b: 'b' }` :arrow_right: `{ b: 'b' }`)
  - `'replace'` - the key will be preserved, but its value will be replaced with the value of `replaceValue`
- `replaceValue` - valid only when `pruneMethod` is set to `'replace'`, this value will be used as the replacement of any pruned values (ie. if configured as `null`, then `{ a: '', b: 'b' }` :arrow_right: `{ a: null, b: 'b' }`)
