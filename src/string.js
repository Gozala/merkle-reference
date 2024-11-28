import * as Tag from './tag.js'
import { toUTF8, fromUTF8 } from './utf8.js'

export const name = 'String'
export const tag = Tag.for('merkle-structure:string/utf-8')

export { fromUTF8, toUTF8 }

/**
 * @param {unknown} value
 */
export const toString = (value) => String(value)

export const toBytes = toUTF8

/**
 * @param {string} value
 */
export const toTree = (value) => [tag, toBytes(value)]
