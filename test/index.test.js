'use strict';

const Hapi = require('hapi');

const Plugin = require('../lib');

function fixture (options, routes) {
  const server = new Hapi.Server();

  server.connection({ port: 80 });

  return server.register([{
    register: Plugin,
    options
  }])
  .then(() => server.route(routes))
  .then(() => server);
}

function handler (request, reply) {
  reply(request.payload);
}

describe('plugin', () => {

  it('fails to load when given bad options', () => {
    return fixture({ invalid: true })
    .catch((err) => err)
    .then((err) => expect(err).to.be.instanceOf(Error));
  });

  it('does not sanitize the request payload for GET requests', () => {
    return fixture(undefined, [{
      method: 'GET',
      path: '/',
      config: { handler }
    }])
    .then((server) => {
      return server.inject({
        method: 'GET',
        url: '/',
        payload: {
          string: 'foo'
        }
      });
    })
    .then((response) => {
      expect(response.result).not.to.exist;
    });
  });

  it('can be disabled globally', () => {
    return fixture({ enabled: false }, [{
      method: 'POST',
      path: '/',
      config: { handler }
    }])
    .then((server) => {
      return server.inject({
        method: 'POST',
        url: '/',
        payload: {
          empty: ''
        }
      });
    })
    .then((response) => {
      expect(response.result).to.eql({ empty: '' });
    });
  });

  it('can be disabled per route', () => {
    return fixture(undefined, [{
      method: 'POST',
      path: '/',
      config: {
        handler,
        plugins: {
          sanitize: { enabled: false }
        }
      }
    }])
    .then((server) => {
      return server.inject({
        method: 'POST',
        url: '/',
        payload: {
          empty: ''
        }
      });
    })
    .then((response) => {
      expect(response.result).to.eql({ empty: '' });
    });
  });

  it('can configure options per route', () => {
    return fixture(undefined, [{
      method: 'POST',
      path: '/',
      config: {
        handler,
        plugins: {
          sanitize: { stripNull: true }
        }
      }
    }])
    .then((server) => {
      return server.inject({
        method: 'POST',
        url: '/',
        payload: {
          null: null
        }
      });
    })
    .then((response) => {
      expect(response.result).to.eql({});
    });
  });

});
