'use strict';

var expect = require('chai').expect;
var Hapi = require('hapi');

describe('plugin', function () {

  var server = new Hapi.Server();
  server.connection({ port: 80 });

  server.register([
    require('inject-then'),
    require('../lib')
  ], function () { });

  server.route([{
    method: 'GET',
    path: '/sanitize_payload',
    config: {
      handler: function (request, reply) {
        reply(request.payload);
      }
    }
  },
  {
    method: 'POST',
    path: '/sanitize_payload',
    config: {
      handler: function (request, reply) {
        reply(request.payload);
      }
    }
  }]);

  it('strips null characters from strings', function () {
    return server.injectThen({
      method: 'POST',
      url: '/sanitize_payload',
      payload: {
        unstripped: 'foo',
        stripped: 'b\0ar'
      }
    })
    .then(function (response) {
      expect(response.result).to.eql({
        unstripped: 'foo',
        stripped: 'bar'
      })
    });
  });

  it('removes keys for values that are blank or empty', function () {
    return server.injectThen({
      method: 'POST',
      url: '/sanitize_payload',
      payload: {
        string: 'foo',
        empty: '',
        blank: '  \t\n ',
        nullCharacter: '\0 '
      }
    })
    .then(function (response) {
      expect(response.result).to.eql({ string: 'foo' });
    });
  });

  it('does not remove keys for non-string values', function () {
    return server.injectThen({
      method: 'POST',
      url: '/sanitize_payload',
      payload: {
        number: 20,
        null: null,
        object: {},
        array: []
      }
    })
    .then(function (response) {
      expect(response.result).to.eql({
        number: 20,
        null: null,
        object: {},
        array: []
      });
    });
  });

  it('sanitizes nested objects', function () {
    return server.injectThen({
      method: 'POST',
      url: '/sanitize_payload',
      payload: {
        object: {
          string: 'foo',
          empty: '',
          object: {
            string: 'bar',
            blank: '  \t\n '
          }
        }
      }
    })
    .then(function (response) {
      expect(response.result).to.eql({
        object: {
          string: 'foo',
          object: { string: 'bar' }
        }
      });
    });
  });

  it('does not sanitize the request payload for GET requests', function () {
    return server.injectThen({
      method: 'GET',
      url: '/sanitize_payload'
    })
    .then(function (response) {
      expect(response.payload).to.eql('');
    })
    .catch(function () {
      expect.fail();
    });
  });

  it('does not sanitize the request payload when it is not an object', function () {
    return server.injectThen({
      method: 'POST',
      url: '/sanitize_payload',
      headers: { 'content-type': 'text/plain' },
      payload: 'foo'
    })
    .then(function (response) {
      expect(response.payload).to.eql('foo')
    })
    .catch(function () {
      expect.fail();
    });
  });

});
