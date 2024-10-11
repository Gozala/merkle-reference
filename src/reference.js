import { base32 } from './lib.js'

const CODE = 0x07

const PREFIX = [1, CODE, 18, 32]
const SHA256_TEMPLATE = new Uint8Array(36)
SHA256_TEMPLATE.set(PREFIX)

class Reference {
  #multihash
  #bytes
  /**
   * @param {Uint8Array} digest
   */
  constructor(digest) {
    const bytes = SHA256_TEMPLATE.slice(0)
    bytes.set(digest, PREFIX.length)

    this.#bytes = bytes
    this.#multihash = {
      digest: this.bytes.subarray(PREFIX.length),
      code: this.bytes[2],
      length: this.bytes[3],
    }
  }
  toString() {
    return base32.encode(this.bytes.subarray(1))
  }
  get multihash() {
    return this.#multihash
  }
  get bytes() {
    return this.#bytes
  }
  get ['/']() {
    return this.#bytes
  }
  get version() {
    return 1
  }
  get code() {
    return CODE
  }

  toJSON() {
    return { '/': base32.encode(this.bytes) }
  }

  get [Symbol.toStringTag]() {
    return `#${this.toString()}`
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `#${this.toString()}`
  }
}

/**
 * @param {unknown} source
 * @returns {source is Reference}
 */
export const is = (source) => {
  const value =
    /** @type {undefined|null|{['/']?: unknown, bytes?: unknown}} */ (source)
  return value != null && value['/'] === value.bytes && value.bytes != null
}

/**
 * @param {Reference} reference
 */
export const digest = (reference) => reference.multihash.digest

/**
 * @param {Uint8Array} digest
 */
export const fromDigest = (digest) => new Reference(digest)

/**
 *
 * @param {Reference} value
 */
export const toTree = (value) => value
