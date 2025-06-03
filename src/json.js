export * from './exports.js'
import * as Tree from './tree.js'
import * as NodeBuilder from './json/value.js'

const sha256Builder = Tree.createBuilder(Tree.sha256, NodeBuilder)

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
