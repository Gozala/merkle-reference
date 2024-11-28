import * as Null from './null.js'
import * as String from './string.js'
import * as Boolean from './boolean.js'
import * as Integer from './integer.js'
import * as Float from './float.js'
import * as Reference from './reference.js'
import * as Bytes from './bytes.js'
import * as Type from './type.js'
import * as Tree from './tree.js'
import { sha256 } from './tree.js'

export * from './reference.js'
export { Null, String, Boolean, Integer, Float, Bytes, Tree, sha256 }

/**
 *
 * @param {unknown} data
 * @returns {Tree.Node}
 */
export const toTree = (data) => {
  const type = Type.infer(data)
  // @ts-expect-error
  return type.toTree(data, toTree)
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export const id = (value, hash = sha256) =>
  Reference.base32.encode(Tree.digest(toTree(value), hash))

/**
 *
 * @param {unknown} value
 * @param {Tree.Hash} hash
 * @returns
 */
export const refer = (value, hash = sha256) =>
  Reference.fromDigest(Tree.digest(toTree(value), hash))

const MARKER = Symbol('Marker')

/**
 * @template {{}|null} [T={}|null]
 * @typedef {{
 *  toJSON(): { '/': string }
 *  readonly ['/']: Uint8Array
 *  readonly [MARKER]?: T
 * }} Reference
 */
