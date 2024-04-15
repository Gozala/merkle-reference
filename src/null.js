import { toTag } from './string.js'
export const name = 'Null'
export const tag = 'merkle-structure:null'

const memory = new Uint8Array(0)

/**
 *
 * @param {null} _
 */
export const toBytes = (_) => memory

/**
 * @param {null} value
 */
export const toTree = (value) => [toTag(tag), toBytes(value)]
