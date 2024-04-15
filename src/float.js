import { toTag } from './string.js'

const memory = new Float64Array(1)

export const name = 'Float'
export const tag = 'merkle-structure:float/double-precision'

/**
 * @param {number} value
 */
export const toBytes = (value) => doublePrecisionFloat(value)

/**
 * Encodes given float as a double precision float.
 *
 * @param {number} value
 */
export const doublePrecisionFloat = (value) => {
  memory[0] = value
  return new Uint8Array(memory.buffer.slice(0))
}

/**
 * @param {number} value
 */
export const toTree = (value) => [toTag(tag), toBytes(value)]
