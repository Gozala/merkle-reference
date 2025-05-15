import { refer, id } from 'merkle-reference'
import { JSONTraversal } from '../src/tree.js'

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
}

/**
 * @type {import('entail').Suite}
 */
export const skipTestTraversal = Object.fromEntries([
  ...Object.entries(fixtures).map(([title, value]) => [
    title,
    /**
     *
     * @param {import('entail').Assert} assert
     */
    (assert) => {
      const json = JSON.parse(JSON.stringify(value))
      assert.deepEqual(
        [...entries(json)],
        [...JSONTraversal.entries(/** @type {any} */ (value))],
        `${JSON.stringify(value)} traversal`
      )
    },
  ]),
])

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
      const json = JSON.parse(JSON.stringify(value))
      assert.deepEqual(
        refer.json(value).toString(),
        refer(json).toString(),
        title
      )
      assert.equal(id.json(value), id(json))
    },
  ]),
])

/**
 * @param {object} source
 */
const entries = (source) =>
  Array.isArray(source) ? source.entries() : Object.entries(source)
