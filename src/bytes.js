import { toTag } from './string.js'
export const name = 'Bytes'
export const tag = 'merkle-structure:bytes/raw'

/**
 * @param {Uint8Array} value
 */
export const toBytes = (value) => value

/**
 * Concatenates two byte arrays.
 *
 * @param {Uint8Array} operand
 * @param {Uint8Array} modifier
 */
export const concat = (operand, modifier) => {
  const bytes = new Uint8Array(operand.length + modifier.length)
  bytes.set(operand, 0)
  bytes.set(modifier, operand.length)
  return bytes
}

/**
 * @param {Uint8Array} self
 * @param {Uint8Array} other
 * @returns {0|-1|1}
 */
export const compare = (self, other) => {
  const count = Math.min(self.length, other.length)
  let offset = 0
  while (offset < count) {
    const delta = self[offset] - other[offset]
    if (delta < 0) {
      return -1
    } else if (delta > 0) {
      return 1
    } else {
      offset++
    }
  }

  const delta = self.length - other.length
  return delta < 0 ? -1 : delta > 0 ? 1 : 0
}

/**
 * @param {Uint8Array} value
 */
export const toTree = (value) => [toTag(tag), toBytes(value)]
