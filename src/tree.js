import { sha256 } from '@noble/hashes/sha256'
import * as Tag from './tag.js'
import * as Bytes from './bytes.js'
import * as Null from './null.js'
import * as Reference from './reference.js'
import * as Value from './value.js'

import { base32 } from './reference.js'

export { sha256 }

/**
 * @typedef {Uint8Array} Leaf
 * @typedef {Array<Leaf|Node>} Branch
 * @typedef {symbol|Branch} Node
 * @typedef {(payload: Uint8Array) => Uint8Array} Hash
 *
 * @typedef {object} NodeBuilder
 * @property {(source: unknown, builder: TreeBuilder) => Node|import('./lib.js').Reference} toTree
 *
 * @typedef {object} Builder
 * @property {(source: unknown) => Node} toTree
 * @property {(node: Node) => Uint8Array} digest
 * @property {<T>(sounce: T) => Reference.View<T>} refer
 * @property {(source: unknown) => string} id
 */

class TreeBuilder {
  /**
   * @param {Hash} hash
   * @param {NodeBuilder} nodeBuilder
   * @param {WeakMap<object, Node>} nodes
   * @param {WeakMap<Node, Uint8Array>} digests
   */
  constructor(
    hash,
    nodeBuilder,
    nodes = new WeakMap(),
    digests = new WeakMap()
  ) {
    this.hash = hash
    this.nodeBuilder = nodeBuilder
    this.nodes = nodes
    this.digests = digests
  }

  /**
   * @param {unknown} source
   */
  id(source) {
    return base32.encode(this.digest(this.toTree(source)))
  }
  /**
   * @param {unknown} source
   */
  refer(source) {
    return Reference.fromDigest(this.digest(this.toTree(source)))
  }

  /**
   * @param {unknown} source
   * @returns {Node}
   */

  toTree(source) {
    let node = this.nodes.get(/** @type {object} */ (source))
    if (!node) {
      node = /** @type {Node} */ (this.nodeBuilder.toTree(source, this))

      if (source && typeof source === 'object') {
        this.nodes.set(/** @type {object} */ (source), node)
      }
    }

    return node
  }

  /**
   * @param {Node} tree
   * @returns {Uint8Array}
   */
  digest(tree) {
    let digest = this.digests.get(tree)
    if (!digest) {
      if (Tag.is(tree)) {
        return this.hash(Tag.toBytes(tree))
      } else if (Reference.is(tree)) {
        digest = Reference.toDigest(tree)
      } else {
        const leaves = []
        for (const node of tree) {
          if (Bytes.is(node)) {
            leaves.push(node)
          } else {
            leaves.push(this.digest(node))
          }
        }

        digest = this.fold(leaves)
      }
      this.digests.set(tree, digest)
    }

    return digest
  }

  /**
   * @param {Uint8Array[]} leaves
   */
  fold(leaves) {
    if (leaves.length === 0) {
      return this.hash(Null.toBytes(null))
    } else if (leaves.length === 1) {
      return leaves[0]
    }

    const layer = [...leaves]
    while (layer.length > 1) {
      const nodes = layer.splice(0)
      const width = nodes.length
      let offset = 0
      while (offset < width) {
        const left = nodes[offset++]
        const right = nodes[offset++]

        if (right) {
          layer.push(this.hash(Bytes.concat(left, right)))
        }
        // Raise rightmost node to the next layer
        else {
          layer.push(left)
        }
      }
    }

    return layer[0]
  }
}

/**
 * @param {Hash} hash
 * @param {NodeBuilder} nodeBuilder
 */
export const createBuilder = (hash, nodeBuilder = Value) =>
  new TreeBuilder(hash, nodeBuilder)
