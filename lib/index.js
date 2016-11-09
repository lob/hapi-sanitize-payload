'use strict';

const Options  = require('./options');
const Sanitize = require('./sanitize');

exports.register = (server, options, next) => {

  const result = Options.schema.validate(options);
  options = Object.assign({}, Options.defaults, result.value);

  if (result.error) {
    return next(result.error);
  }

  server.ext('onPostAuth', (request, reply) => {
    const routeOptions = Object.assign({}, options, request.route.settings.plugins.sanitize);

    if (!routeOptions.enabled || request.method === 'get') {
      return reply.continue();
    }

    request.payload = Sanitize(request.payload, routeOptions);

    reply.continue();
  });

  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
