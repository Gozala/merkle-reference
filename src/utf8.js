export const encoder = new TextEncoder()
export const decoder = new TextDecoder()

/**
 * @type {(text: string) => Uint8Array}
 */
export const toUTF8 = encoder.encode.bind(encoder)

/**
 * @type {(bytes: Uint8Array) => string}
 */
export const fromUTF8 = decoder.decode.bind(decoder)
