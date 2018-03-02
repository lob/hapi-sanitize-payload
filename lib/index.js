'use strict';

const Options  = require('./options');
const Sanitize = require('./sanitize');

exports.plugin = {
  register: (server, options) => {
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

      request.payload = Sanitize(request.payload, routeOptions);

      return h.continue;
    });
  },
  pkg: require('../package.json')
};
