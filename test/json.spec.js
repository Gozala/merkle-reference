import { refer, id } from 'merkle-reference'
import * as Reference from '../src/reference.js'

/** @type {Record<string, unknown>} */
const fixtures = {
  'object with doubly nested toJSON': {
    depth: 0,
    toJSON() {
      return {
        depth: 1,
        toJSON() {
          return {
            depth: 2,
          }
        },
      }
    },
  },
  'undefined in array is replaced by null': [1, undefined, 2],
  'function in array is replaced by null': [1, () => 2, 3],
  'symbol in array is replaced by null': [1, Symbol.for('2'), 3],
  'String instance is replaced by string': [1, new String('2'), 3],
  'undefined property': {
    x: 1,
    y: undefined,
  },
  'NaN is replaced by null': [1, NaN, 3],
  'Infinity is replaced by null': [1, Infinity, -Infinity, 3],
  'Date object is serialized to string': [
    1,
    new Date('2023-01-01T00:00:00Z'),
    3,
  ],
  'RegExp is converted to empty object': [1, /regex/, 3],
  'null values are preserved': [1, null, 3],
  'nested arrays': [1, [2, [3, [4]]]],
  'nested objects': { a: { b: { c: { d: 4 } } } },
  'array with mixed types': [1, 'string', true, null, { obj: true }, [1, 2]],
  'Boolean object is converted to primitive': [
    new Boolean(true),
    new Boolean(false),
  ],
  'Number object is converted to primitive': [new Number(42), new Number(NaN)],
  'Empty objects and arrays': [{}, []],
  'Object with numeric keys': {
    1: 'one',
    2: 'two',
  },
  'Special characters in strings': [
    '\\',
    '\n',
    '\t',
    '\r',
    '\b',
    '\f',
    '"',
    "'",
  ],
  'Unicode characters': ['😀', '您好', 'ñ', 'ü', '∑'],
  'custom object with toJSON method': {
    value: 42,
    label: 'answer',
    toJSON() {
      // @ts-ignore
      return { serialized: true, value: this.value }
    },
  },
  'object with non-enumerable properties': (() => {
    const obj = { visible: true }
    Object.defineProperty(obj, 'hidden', {
      value: 'invisible',
      enumerable: false,
    })
    return obj
  })(),
  'object with getters': {
    _value: 42,
    get computed() {
      // @ts-ignore
      return this._value * 2
    },
  },
  'sparse array': (() => {
    const arr = new Array(5)
    arr[0] = 'first'
    arr[4] = 'last'
    return arr
  })(),
  'array with negative length': { length: -1 },
  'object with prototype methods': Object.create(
    {
      inheritedMethod() {
        return 'inherited'
      },
    },
    { ownProp: { value: 'own', enumerable: true } }
  ),
  'Uint8Array bytes': new Uint8Array([1, 2, 3, 4]),
  'Reference object': Reference.fromDigest(new Uint8Array(32).fill(42)),
}

/**
 * @type {import('entail').Suite}
 */
export const testJSONMode = Object.fromEntries([
  ...Object.entries(fixtures).map(([title, value]) => [
    title,
    /**
     *
     * @param {import('entail').Assert} assert
     */
    (assert) => {
      // Special handling for Uint8Array and Reference objects
      if (value instanceof Uint8Array || Reference.is(value)) {
        // These should be handled directly by json-type.js without JSON.stringify
        const result = refer.json(value)
        assert.ok(result, `Should handle ${title} directly`)
        return
      }

      const stringified = JSON.stringify(value)

      // Handle cases where JSON.stringify returns undefined
      if (stringified === undefined) {
        // These cases should either throw or be handled consistently
        // For now, let's verify they throw since JSON can't represent them
        assert.throws(() => refer.json(value), /Unknown type|Cannot convert/)
        return
      }

      const json = JSON.parse(stringified)

      // For cases where JSON.stringify successfully converts the value,
      // the JSON mode should produce the same result as processing the stringified result
      const jsonModeResult = refer.json(value).toString()
      const normalModeResult = refer(json).toString()

      assert.deepEqual(
        jsonModeResult,
        normalModeResult,
        `JSON mode result should match normal mode on JSON.stringify result for: ${title}`
      )
      assert.equal(id.json(value), id(json))
    },
  ]),
])

/**
 * @type {import('entail').Suite}
 */
export const testEdgeCases = {
  'test Uint8Array handling': (assert) => {
    // Test line 133: Bytes.toTree case
    const bytes = new Uint8Array([1, 2, 3, 4])
    const result = refer.json(bytes)
    assert.ok(result, 'Should handle Uint8Array directly')

    // Verify it creates a proper tree structure
    const expected = refer(bytes)
    assert.equal(result.toString(), expected.toString())
  },

  'test Reference object handling': (assert) => {
    // Test that Reference objects can be processed without errors
    const ref = Reference.fromDigest(new Uint8Array(32).fill(42))
    const result = refer.json(ref)
    assert.ok(result, 'Should handle Reference objects directly')

    // The result should be a valid reference-like structure
    assert.ok(
      result.toString().length > 0,
      'Result should have a valid string representation'
    )

    // Test that we can also process the reference through normal refer()
    const normalResult = refer(ref)
    assert.ok(
      normalResult,
      'Normal refer should also work with Reference objects'
    )
  },

  'test bigint handling': (assert) => {
    // Test line 124: bigint case
    const bigintValue = 123456789012345678901234567890n
    const result = refer.json(bigintValue)
    assert.ok(result, 'Should handle bigint values')

    // Verify it creates the same result as refer() with the bigint
    const expected = refer(bigintValue)
    assert.equal(result.toString(), expected.toString())
  },

  'test float handling': (assert) => {
    // Test line 122: Float.toTree case
    const floatValue = 123.456
    const result = refer.json(floatValue)
    assert.ok(result, 'Should handle float values')

    // Verify it creates the same result as refer() with the float
    const expected = refer(floatValue)
    assert.equal(result.toString(), expected.toString())
  },

  'test undefined normalization error': (assert) => {
    // Test lines 114-115: throw TypeError when normalized === undefined
    assert.throws(() => {
      // Functions should be normalized to undefined and throw an error
      refer.json(function () {
        return 'test'
      })
    }, /Unknown type/)

    assert.throws(() => {
      // Symbols should be normalized to undefined and throw an error
      refer.json(Symbol('test'))
    }, /Unknown type/)

    assert.throws(() => {
      // undefined should throw an error
      refer.json(undefined)
    }, /Unknown type/)
  },

  'test Reference.is path directly': (assert) => {
    // Test line 137: Reference.is(normalized) returns normalized
    // Create a reference-like object and process it with refer.json
    const refLike = { '/': refer({ hello: 'world' })['/'] }
    const result = refer.json(refLike)

    // The result should be a valid reference
    assert.ok(result, 'Should process reference-like object')
    assert.ok(Reference.is(refLike), 'Input should pass Reference.is check')
  },

  'test unknown type error': (assert) => {
    // Test lines 143-144: default case TypeError
    // This should trigger the default case and throw TypeError
    assert.throws(() => {
      // Create a value that toJSON returns as a Symbol (unhandled type)
      const badValue = {
        toJSON() {
          return Symbol('unhandled')
        },
      }
      refer.json(badValue)
    }, /Unknown type/)
  },
}
