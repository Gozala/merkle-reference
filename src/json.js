export * from './exports.js'
import * as Tree from './tree.js'

const sha256Builder = Tree.createBuilder(
  Tree.sha256,
  Tree.JSONTraversal.entries
)

/**
 * @param {unknown} value
 * @param {Tree.Builder} builder
 */
export const refer = (value, builder = sha256Builder) => builder.refer(value)

/**
 * @param {unknown} value
 * @param {Tree.Builder} builder
 */
export const id = (value, builder = sha256Builder) => builder.id(value)
