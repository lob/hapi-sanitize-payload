# hapi-sanitize-payload [![npm version](https://badge.fury.io/js/hapi-sanitize-payload.svg)](http://badge.fury.io/js/hapi-sanitize-payload) [![Build Status](https://travis-ci.org/lob/hapi-sanitize-payload.svg)](https://travis-ci.org/lob/hapi-sanitize-payload)

A plugin to recursively sanitize or prune values in a `request.payload` object.

Currently uses the following rules:

- Removes null characters (ie. `\0`) from string values
- Deletes from the payload keys with a value of empty string (ie. `''`), or optionally replaces them with a different value
- Deletes from the payload keys with a value consisting entirely of whitespace (ie. `' \t\n '`), or optionally replaces them with a different value
- Deletes whitespace from ends of string (ie. `'      text      '` becomes `'text'`)
- Optionally deletes/replaces `null` values

## Registering the plugin

```js
const registerPlugins = async (server) => {
  await server.register([
    { plugin: require('hapi-sanitize-payload'), options: { pruneMethod: 'delete' } }
  ]);
};
```

## Options

- `enabled` - whether or not the plugin is enabled.
- `pruneMethod` - the method the sanitizer uses when a value that is to be pruned is encountered. Defaults to `'delete'`. The value must be one of:
  - `'delete'` - the key will be removed from the payload entirely (ie. `{ a: '', b: 'b' }` :arrow_right: `{ b: 'b' }`).
  - `'replace'` - the key will be preserved, but its value will be replaced with the value of `replaceValue`.
- `replaceValue` - valid only when `pruneMethod` is set to `'replace'`, this value will be used as the replacement of any pruned values (ie. if configured as `null`, then `{ a: '', b: 'b' }` :arrow_right: `{ a: null, b: 'b' }`).
- `stripNull` - a boolean value to signify whether or not `null` properties should be pruned with the same `pruneMethod` and `replaceValue` as above. Defaults to `false`.
- `timing` - a function to be called once sanitizing is complete, having a single Number argument representing the milliseconds the operation took to complete.

Each of the above options can be configured on a route-by-route basis via the `sanitize` plugin object.

```js
const registerRoutes = (server) => {
  server.route({
    method: 'POST',
    path: '/users',
    handler: () => {
      // handler logic
    },
    options: {
      plugins: {
        sanitize: { enabled: false }
      }
    }
  });
};
```

Setting up the server.

```js
(async () => {
  try {
    const server = new Hapi.Server();

    await registerPlugins(server);
    registerRoutes(server);

    await server.start();
  } catch (err) {
    // Insert your preferred error handling here...
  }
)();
```
