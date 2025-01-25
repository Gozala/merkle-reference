import { base32 } from 'multiformats/bases/base32'

export { base32 }

/**
 * Multiformat code for the CIDv1.
 * @see https://github.com/multiformats/multicodec/blob/352d05ad430713088e867216152725f581387bc8/table.csv#L3
 */
export const CID_CODE = /** @type {0x01} */ (0x01)

/**
 * Multiformat code for the merkle reference.
 * @see https://github.com/multiformats/multicodec/pull/357
 */
export const CODE = /** @type {0x07} */ (0x07)

/**
 * @see https://github.com/multiformats/multicodec/blob/master/table.csv#L9
 */
export const SHA256_CODE = /** @type {0x12} */ (0x12)

/**
 * Sha256 multihash digest size is 32 bytes.
 * @see https://github.com/multiformats/rust-multihash/blob/4c0ef5268355308d7f083482dad1c81318db4f6b/codetable/src/hasher_impl.rs#L207
 */
export const DIGEST_SIZE = 32

const PREFIX = [CID_CODE, CODE, SHA256_CODE, DIGEST_SIZE]

export const PREFIX_SIZE = PREFIX.length

const TEMPLATE = new Uint8Array(PREFIX.length + DIGEST_SIZE)
TEMPLATE.set(PREFIX)

/**
 * Binary representation of the merkle reference is as follows
 *
 * ```ts
 * [MerkleReference: 0x07,
 *  SHA256: 0x12,
 *  Size: 32,
 *  ...(Uint8Array & {length: 32})
 * ]
 * ```
 *
 * So first 3 bytes represent a header and next 32 bytes
 * represent the body.
 */
export const SIZE = 3 + DIGEST_SIZE

/**
 * @template T
 */
class Reference {
  #multihash
  #bytes

  /**
   * @param {Uint8Array} digest
   * @param {T} [of]
   */
  constructor(digest, of) {
    const bytes = TEMPLATE.slice(0)
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
    return toJSON(this)
  }

  get [Symbol.toStringTag]() {
    return `#${this.toString()}`
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `#${this.toString()}`
  }
}

/**
 * @template {{} | null} T
 * @param {unknown|import('./lib.js').Reference<T>} source
 * @returns {source is import('./lib.js').Reference<T>}
 */
export const is = (source) => {
  const bytes =
    /** @type {undefined|null|{['/']?: {[key:PropertyKey]: unknown}|undefined|null}} */
    (source)?.['/']

  return (
    bytes?.[0] === CID_CODE &&
    bytes?.[1] === CODE &&
    bytes?.[2] === SHA256_CODE &&
    bytes?.[3] === DIGEST_SIZE &&
    bytes?.length === TEMPLATE.length
  )
}

/**
 * @param {Uint8Array} digest
 */
export const fromDigest = (digest) => {
  if (digest.length !== DIGEST_SIZE) {
    throw new RangeError(`Invalid digest size ${digest.length}`)
  } else {
    return new Reference(digest)
  }
}

/**
 * @template {{}|null} T
 * @param {import('./lib.js').Reference<T>} value
 */
export const toTree = (value) => value

/**
 * Takes string produced by `refer({}).toString()` and creates equal reference.
 * If string is not a valid reference serialization it will return `implicit`
 * that was provided. If implicit is not provided an error will be thrown
 * instead.
 *
 * @template {{}|null} T
 * @template {{}|null} [Implicit=never]
 * @param {string} source
 * @param {Implicit} [implicit]
 * @returns {import('./lib.js').Reference<T>|Implicit}
 */
export const fromString = (source, implicit) => {
  try {
    const bytes = base32.decode(source)
    return fromBytes(bytes)
  } catch (error) {
    if (implicit === undefined) {
      throw new ReferenceError(`Invalid reference ${source}`)
    } else {
      return implicit
    }
  }
}

/**
 * @param {Uint8Array} source
 */
export const fromBytes = (source) => {
  if (source[0] !== CODE) {
    throw new ReferenceError(`Invalid reference ${source}`)
  }

  if (source[1] !== SHA256_CODE) {
    throw new ReferenceError(`Unsupported hashing algorithm ${source[1]}`)
  }

  if (source[2] !== DIGEST_SIZE) {
    throw new ReferenceError(`Invalid digest size ${source[2]}`)
  }

  if (source.length < SIZE) {
    throw new RangeError(`Incomplete Reference byte sequence`)
  }

  return fromDigest(source.subarray(3, 3 + DIGEST_SIZE))
}

/**
 * @param {import('./lib.js').Reference} reference
 */
export const toDigest = (reference) => reference['/'].subarray(PREFIX.length)

/**}
 * @param {import('./lib.js').Reference} reference
 * @returns
 */
export const toBytes = (reference) => reference['/'].subarray(1)

/**
 * @param {import('./lib.js').Reference} reference
 */
export const toJSON = (reference) => ({ '/': base32.encode(reference['/']) })

/**
 * @param {{'/': string}} json
 */
export const fromJSON = (json) =>
  fromBytes(base32.decode(json['/']).subarray(1))
