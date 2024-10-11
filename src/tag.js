import { toUTF8 } from './utf8.js'

/**
 * @param {string} name
 */
export const fromString = (name) => Symbol.for(name)

/**
 * @param {unknown} value
 * @returns {value is symbol}
 */
export const is = (value) => typeof value === 'symbol'

/**
 *
 * @param {symbol} value
 */
export const toBytes = (value) =>
  toUTF8(/** @type {string} */ (value.description))

export { fromString as for }
