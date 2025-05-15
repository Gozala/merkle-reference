export * from './exports.js'
import * as Tree from './tree.js'
import * as json from './json.js'

const sha256Builder = Tree.createBuilder(
  Tree.sha256,
  Tree.StrictTraversal.entries
)

export const id = Object.assign(
  /**
   * @param {unknown} value
   * @param {Tree.Builder} builder
   */
  (value, builder = sha256Builder) => builder.id(value),
  {
    json: json.id,
  }
)

export const refer = Object.assign(
  /**
   * @param {unknown} value
   * @param {Tree.Builder} builder
   */
  (value, builder = sha256Builder) => builder.refer(value),
  {
    json: json.refer,
  }
)
