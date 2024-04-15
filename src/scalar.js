import * as Bytes from './bytes.js'
import * as Integer from './integer.js'
import * as Float from './float.js'
import * as Null from './null.js'
import * as String from './string.js'
import * as Boolean from './boolean.js'

/**
 * @typedef {number|bigint|boolean|string|null|Uint8Array} scalar
 * @param {scalar} value
 */
export const infer = (value) => {
  switch (typeof value) {
    case 'number':
      return Number.isInteger(value) ? Integer : Float
    case 'bigint':
      return Integer
    case 'boolean':
      return Boolean
    case 'string':
      return String
    default: {
      if (value === null) {
        return Null
      } else if (value instanceof Uint8Array) {
        return Bytes
      } else {
        throw new Error(`Unsupported data type ${JSON.stringify(value)}`)
      }
    }
  }
}
