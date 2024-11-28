import * as Tag from './tag.js'
export const name = 'Null'
export const tag = Tag.for('merkle-structure:null')

const memory = new Uint8Array(0)

/**
 *
 * @param {null} _
 */
export const toBytes = (_) => memory

/**
 * @param {null} value
 */
export const toTree = (value) => [tag, toBytes(value)]
