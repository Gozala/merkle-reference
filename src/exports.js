export * as Null from './null.js'
export * as String from './string.js'
export * as Boolean from './boolean.js'
export * as Integer from './integer.js'
export * as Float from './float.js'
export * as Reference from './reference.js'
export * as Bytes from './bytes.js'
export * as Tree from './tree.js'
export { sha256 } from './tree.js'
export * from './reference.js'

const MARKER = Symbol('Marker')

/**
 * @template {{}|null} [T={}|null]
 * @typedef {{
 *  readonly ['/']: Uint8Array
 *  readonly [MARKER]?: T
 * }} Reference
 */
