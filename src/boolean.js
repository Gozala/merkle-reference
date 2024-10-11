import * as Tag from './tag.js'

const True = new Uint8Array([1])
const False = new Uint8Array([0])

export const tag = Tag.for('merkle-structure:boolean/byte')

/**
 * @param {boolean} value
 */
export const toBytes = (value) => (value ? True : False)

/**
 * @param {boolean} value
 */
export const toTree = (value) => [tag, toBytes(value)]
