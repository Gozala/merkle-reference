import { toTag } from './string.js'
export const name = 'Boolean'
export const tag = 'merkle-structure:boolean/byte'

const True = new Uint8Array([1])
const False = new Uint8Array([0])

/**
 * @param {boolean} value
 */
export const toBytes = (value) => (value ? True : False)

/**
 * @param {boolean} value
 */
export const toTree = (value) => [toTag(tag), toBytes(value)]
