const utf8 = { encoder: new TextEncoder(), decoder: new TextDecoder() }

export const name = 'String'
export const tag = 'merkle-structure:string/utf-8'

/**
 * @param {string} text
 */
export const toUTF8 = (text) => utf8.encoder.encode(text)

/**
 * @param {Uint8Array} bytes
 */
export const fromUTF8 = (bytes) => utf8.decoder.decode(bytes)

export const toBytes = toUTF8

const TAG = new Uint8Array([])
/**
 * @param {string} name
 */
export const toTag = (name) => [TAG, toUTF8(name)]

/**
 * @param {string} value
 */
export const toTree = (value) => [toTag(tag), toBytes(value)]
