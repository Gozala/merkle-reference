import * as List from '../list.js'
import { toJSON } from './value.js'

/**
 * JSON-aware array traversal that normalizes elements
 *
 * @param {Iterable<unknown>} array
 */
export function* iterate(array) {
  // Apply JSONTraversal logic: substitute non-json members with null
  for (const element of array) {
    const json = toJSON(element)
    yield json === undefined ? null : json
  }
}

/**
 * @param {Iterable<unknown>} data
 * @param {import('../tree.js').Builder} builder
 */
export const toTree = (data, builder) => List.toTree(iterate(data), builder)
