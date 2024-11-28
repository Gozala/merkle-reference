import * as Tag from './tag.js'

export const tag = Tag.for('merkle-structure:bytes/raw')

/**
 * @param {unknown} source
 * @returns {source is Uint8Array}
 */
export const is = (source) =>
  source instanceof Uint8Array ||
  // ⚠️ `instanceof Uint8Array` is false in vitest and possibly other
  // environments that use jsdom, so we resort to this workaround.
  // @see https://github.com/vitest-dev/vitest/issues/4043
  (Array.isArray(source) && /** @type {any} */ (source).BYTES_PER_ELEMENT === 1)

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
export const toTree = (value) => [tag, toBytes(value)]
