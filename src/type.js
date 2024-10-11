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
 */
export const infer = (data) => {
  switch (typeof data) {
    case 'number':
      return Number.isInteger(data) ? Integer : Float
    case 'bigint':
      return Integer
    case 'boolean':
      return Boolean
    case 'string':
      return String
    case 'object': {
      if (data === null) {
        return Null
      } else if (data instanceof Uint8Array) {
        return Bytes
      } else if (Array.isArray(data)) {
        return List
      } else if (Reference.is(data)) {
        return Reference
      } else {
        return Map
      }
    }
    default: {
      throw new TypeError(`Unknown type ${String.toString(data)}`)
    }
  }
}
