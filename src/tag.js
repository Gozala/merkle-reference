import { toUTF8 } from './string.js'
const TAG = new Uint8Array([])

/**
 * @param {string} name
 */
export const toTree = (name) => [TAG, toUTF8(name)]
