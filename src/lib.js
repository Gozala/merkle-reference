import * as Null from './null.js'
import * as String from './string.js'
import * as Boolean from './boolean.js'
import * as Integer from './integer.js'
import * as Float from './float.js'
import * as Reference from './reference.js'
import * as Bytes from './bytes.js'
import * as Tree from './tree.js'
import { sha256 } from './tree.js'

export * from './reference.js'
export { Null, String, Boolean, Integer, Float, Bytes, Tree, sha256 }

const sha256Builder = Tree.createBuilder(sha256)

/**
 * @param {unknown} value
 * @param {Tree.Builder} builder
 * @returns {string}
 */
export const id = (value, builder = sha256Builder) =>
  Reference.base32.encode(builder.digest(builder.toTree(value)))

/**
 *
 * @param {unknown} value
 * @param {Tree.Builder} builder
 */
export const refer = (value, builder = sha256Builder) =>
  Reference.fromDigest(builder.digest(builder.toTree(value)))

const MARKER = Symbol('Marker')

/**
 * @template {{}|null} [T={}|null]
 * @typedef {{
 *  readonly ['/']: Uint8Array
 *  readonly [MARKER]?: T
 * }} Reference
 */
