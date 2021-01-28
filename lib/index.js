'use strict';

const Options  = require('./options');
const Sanitize = require('./sanitize');

exports.plugin = {
  register: async (server, options) => {
    const result = Options.schema.validate(options);
    options = Object.assign({}, Options.defaults, result.value);

    if (result.error) {
      throw result.error;
    }

    server.ext('onPostAuth', (request, h) => {
      const routeOptions = Object.assign({}, options, request.route.settings.plugins.sanitize);

      if (!routeOptions.enabled || request.method === 'get') {
        return h.continue;
      }

      const start = typeof routeOptions.timing === 'function' ?
        Date.now() :
        null;

      request.payload = Sanitize(request.payload, routeOptions);

      if (start) {
        routeOptions.timing(Date.now() - start);
      }

      return h.continue;
    });
  },
  pkg: require('../package.json')
};
