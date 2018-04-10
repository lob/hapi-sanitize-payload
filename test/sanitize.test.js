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

  it('overrides options on certain keys if fieldOverride is passed in', () => {
    const input = {
      key1: 'b\0ar',
      key2: '   bye',
      key3: '\0why  ',
      key4: '',
      key5: null
    };

    const defaultResult = Sanitize(input);
    const overrideResult = Sanitize(input, {
      fieldOverride: {
        key4: {
          pruneMethod: 'replace',
          replaceValue: null
        }
      }
    });

    expect(defaultResult).to.eql({
      key1: 'bar',
      key2: 'bye',
      key3: 'why',
      key5: null
    });
    expect(overrideResult).to.eql({
      key1: 'bar',
      key2: 'bye',
      key3: 'why',
      key4: null,
      key5: null
    });
  });

  it('overrides options on certain keys if fieldOverride is passed in', () => {
    const input = {
      key1: 'b\0ar',
      key2: '   bye',
      key3: '\0why  ',
      key4: ' ',
      key5: null
    };

    const defaultResult = Sanitize(input);
    const overrideResult = Sanitize(input, {
      fieldOverride: {
        key4: {
          pruneMethod: 'replace',
          replaceValue: null
        }
      }
    });

    expect(defaultResult).to.eql({
      key1: 'bar',
      key2: 'bye',
      key3: 'why',
      key5: null
    });
    expect(overrideResult).to.eql({
      key1: 'bar',
      key2: 'bye',
      key3: 'why',
      key4: null,
      key5: null
    });
  });

  it(`overrides options on nested objects if fieldOverride is passed in`, () => {
    const input = {
      key1: {
        nested1: 'b\0ar',
        nested2: '',
        nested3: '  '
      },
      key2: 'bye',
      key3: {
        nested1: 'b\0ar',
        nested2: '',
        nested3: '  '
      },
      key4: '\0bye '
    };

    const defaultResult = Sanitize(input);
    const overrideResult = Sanitize(input, {
      fieldOverride: {
        key1: {
          pruneMethod: 'replace',
          replaceValue: undefined
        }
      }
    });

    expect(defaultResult).to.eql({
      key1: {
        nested1: 'bar'
      },
      key2: 'bye',
      key3: {
        nested1: 'bar'
      },
      key4: 'bye'
    });
    expect(overrideResult).to.eql({
      key1: {
        nested1: 'bar',
        nested2: undefined,
        nested3: undefined
      },
      key2: 'bye',
      key3: {
        nested1: 'bar'
      },
      key4: 'bye'
    });
  });

});
