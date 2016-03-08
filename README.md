# hapi-sanitize-payload [![npm version](https://badge.fury.io/js/hapi-sanitize-payload.svg)](http://badge.fury.io/js/hapi-sanitize-payload) [![Build Status](https://travis-ci.org/lob/hapi-sanitize-payload.svg)](https://travis-ci.org/lob/hapi-sanitize-payload)

A plugin to recursively sanitize or prune values in a `request.payload` object.

Currently uses the following rules:

- Removes null characters (ie. `\0`) from string values
- Deletes from the payload keys with a value of empty string (ie. `''`)
- Deletes from the payload keys with a value consisting entirely of whitespace (ie. `' \t\n '`)

## Registering the plugin

```js
var Hapi = require('hapi');

var server = new Hapi.Server();

server.register([
  require('hapi-sanitize-payload')
], function (err) {
  // Insert your preferred error handling here...
});
```
