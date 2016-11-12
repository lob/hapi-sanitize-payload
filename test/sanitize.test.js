'use strict';

const Sanitize = require('../lib/sanitize');

describe('sanitize', () => {

  it('strips null characters from strings', () => {
    const input = {
      unstripped: 'foo',
      stripped: 'b\0ar'
    };

    const result = Sanitize(input);

    expect(result).to.eql({
      unstripped: 'foo',
      stripped: 'bar'
    });
  });

  it('trims whitespace from ends of strings', () => {
    const input = { whitespace: '   wow   ' };

    const result = Sanitize(input);

    expect(result).to.eql({ whitespace: 'wow' });
  });

  it('removes keys for values that are blank or empty', () => {
    const input = {
      string: 'foo',
      empty: '',
      blank: '  \t\n ',
      nullCharacter: '\0 '
    };

    const result = Sanitize(input);

    expect(result).to.eql({ string: 'foo' });
  });

  it('does not remove keys for non-string values', () => {
    const input = {
      number: 20,
      null: null,
      object: {},
      array: []
    };

    const result = Sanitize(input);

    expect(result).to.eql(input);
  });

  it('sanitizes nested objects', () => {
    const input = {
      object: {
        string: 'foo',
        empty: '',
        object: {
          string: 'bar',
          blank: '  \t\n '
        }
      }
    };

    const result = Sanitize(input);

    expect(result).to.eql({
      object: {
        string: 'foo',
        object: { string: 'bar' }
      }
    });
  });

  it('replaces pruned values when pruneMethod = \'replace\'', () => {
    const input = {
      string: 'foo',
      empty: '',
      blank: '  \t\n ',
      nullCharacter: '\0 '
    };

    const result = Sanitize(input, { pruneMethod: 'replace', replaceValue: null });

    expect(result).to.eql({
      string: 'foo',
      empty: null,
      blank: null,
      nullCharacter: null
    });
  });

  it('prunes null values when stripNull = true', () => {
    const input = {
      string: 'foo',
      null: null,
      object: {
        string: 'bar',
        null: null
      }
    };

    const result = Sanitize(input, { stripNull: true });

    expect(result).to.eql({
      string: 'foo',
      object: { string: 'bar' }
    });
  });

  it('does nothing if the value is not an object', () => {
    const input = 'foo';

    const result = Sanitize(input);

    expect(result).to.eql(input);
  });

});
