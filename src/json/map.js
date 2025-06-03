import { toJSON } from './value.js'
import * as Map from '../map.js'

/**
 * Create an iterable that handles JSON normalization
 *
 * @param {object} source
 * @returns {Iterable<[unknown, unknown]>}
 */
export function* iterate(source) {
  for (const [name, value] of Object.entries(source)) {
    const json = toJSON(value)
    if (json !== undefined) {
      yield [name, json]
    }
  }
}

/**
 * JSON-aware object traversal that normalizes values
 * @param {object} source
 * @param {import('../tree.js').Builder} builder
 */
export const toTree = (source, builder) => Map.from(iterate(source), builder)
