import * as Null from '../null.js'
import * as StringType from '../string.js'
import * as Boolean from '../boolean.js'
import * as Integer from '../integer.js'
import * as Float from '../float.js'
import * as Bytes from '../bytes.js'

import * as Map from './map.js'
import * as List from './list.js'
import * as Reference from '../reference.js'
/**
 * JSON normalization function that does equivalent of `JSON.parse(JSON.stringify(value))`
 *
 * @param {unknown} value
 */
export const toJSON = (value) => {
  switch (value) {
    case Infinity:
    case -Infinity:
      return undefined
    default: {
      switch (typeof value) {
        case 'function':
        case 'undefined':
        case 'symbol':
          return undefined
        case 'number':
          return isNaN(/** @type {number} */ (value)) ? undefined : value
        case 'object': {
          if (value === null) {
            return null
          } else if (value instanceof Date) {
            return value.toISOString()
          } else if (value instanceof RegExp) {
            return {}
          } else if (
            typeof (/** @type {{toJSON?:unknown}} */ (value)?.toJSON) ===
            'function'
          ) {
            return /** @type {{toJSON?:unknown}} */ (value).toJSON()
          } else if (value instanceof globalThis.String) {
            return `${value}`
          } else if (value instanceof globalThis.Boolean) {
            return value.valueOf()
          } else if (value instanceof globalThis.Number) {
            const num = value.valueOf()
            return isNaN(num) ? undefined : num
          } else {
            return value
          }
        }
        default: {
          return value
        }
      }
    }
  }
}

/**
 * @param {unknown} data
 * @param {import('../tree.js').Builder} builder
 * @returns {import('../tree.js').Node|import('../lib.js').Reference}
 */
export const toTree = (data, builder) => {
  // Apply toJSON normalization first (like JSONTraversal.entries does)
  const json = toJSON(data)

  // If top-level normalization results in undefined, the value is unrepresentable in JSON
  if (json === undefined) {
    throw new TypeError(`Unknown type ${globalThis.String(data)}`)
  }

  // Now determine type based on normalized value and handle traversal
  switch (typeof json) {
    case 'number':
      return Number.isInteger(json) ? Integer.toTree(json) : Float.toTree(json)
    case 'bigint':
      return Integer.toTree(json)
    case 'boolean':
      return Boolean.toTree(json)
    case 'string':
      return StringType.toTree(json)
    case 'object': {
      if (json === null) {
        return Null.toTree(json)
      } else if (Bytes.is(json)) {
        return Bytes.toTree(json)
      } else if (Array.isArray(json)) {
        return List.toTree(json, builder)
      } else if (Reference.is(json)) {
        return json
      } else {
        return Map.toTree(json, builder)
      }
    }
    default: {
      throw new TypeError(`Unknown type ${globalThis.String(json)}`)
    }
  }
}
