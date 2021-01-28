'use strict';

const Hapi = require('hapi');

const Plugin = require('../lib');

const fixture = async (options, routes) => {
  const server = new Hapi.Server();

  await server.register({ plugin: Plugin, options });
  server.route(routes);
  return server;
};

const handler = (request) => request.payload;

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
      handler
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
      handler
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
      handler,
      options: {
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
      handler,
      options: {
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

  it('can track timing', () => {
    let metricCalled = false;

    return fixture(undefined, [{
      method: 'POST',
      path: '/',
      handler,
      options: {
        plugins: {
          sanitize: { timing: (ms) => {
            metricCalled = true;
            expect(typeof ms).to.eql('number');
            expect(ms).to.be.within(0, 100);
          }}
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
      expect(metricCalled).to.eql(true);
    });
  });

});
