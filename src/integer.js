import * as Tag from './tag.js'
export const tag = Tag.for('merkle-structure:integer/leb128')
export const name = 'Integer'

/**
 * @param {bigint|number} value
 */
export const toBytes = (value) => leb128(BigInt(value))

/**
 * @param {bigint} value
 */
export const leb128 = (value) => {
  let bytes = []
  let more = true
  while (more) {
    let byte = value & 0x7fn
    value >>= 7n
    if (
      (value === 0n && (byte & 0x40n) === 0n) ||
      (value === -1n && (byte & 0x40n) !== 0n)
    ) {
      more = false
    } else {
      byte |= 0x80n
    }
    bytes.push(Number(byte))
  }

  return new Uint8Array(bytes)
}

/**
 * @param {bigint|number} value
 */
export const toTree = (value) => [tag, toBytes(value)]
