import * as Null from './null.js'
import * as String from './string.js'
import * as Boolean from './boolean.js'
import * as Integer from './integer.js'
import * as Float from './float.js'
import * as Bytes from './bytes.js'
import * as List from './list.js'
import * as Map from './map.js'
import * as Reference from './reference.js'

/**
 * @param {unknown} data
 * @param {import('./tree.js').Builder} builder
 * @returns {import('./tree.js').Branch|import('./lib.js').Reference}
 */
export const toTree = (data, builder) => {
  switch (typeof data) {
    case 'number':
      return Number.isInteger(data) ? Integer.toTree(data) : Float.toTree(data)
    case 'bigint':
      return Integer.toTree(data)
    case 'boolean':
      return Boolean.toTree(data)
    case 'string':
      return String.toTree(data)
    case 'object': {
      if (data === null) {
        return Null.toTree(data)
      } else if (Bytes.is(data)) {
        return Bytes.toTree(data)
      } else if (Array.isArray(data)) {
        return List.toTree(data, builder)
      } else if (Reference.is(data)) {
        return Reference.toTree(data)
      } else {
        return Map.toTree(data, builder)
      }
    }
    default: {
      throw new TypeError(`Unknown type ${String.toString(data)}`)
    }
  }
}
