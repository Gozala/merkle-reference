import { sha256 } from '@noble/hashes/sha256'
import * as Tag from './tag.js'
import * as Bytes from './bytes.js'
import * as Null from './null.js'
import * as Reference from './reference.js'

export { sha256 }

/**
 * @typedef {Uint8Array} Leaf
 * @typedef {Array<Leaf|Node>} Branch
 * @typedef {symbol|Branch} Node
 * @typedef {(payload: Uint8Array) => Uint8Array} Hash
 */

/**
 * @param {Node} tree
 * @param {Hash} hash
 * @returns {Uint8Array}
 */
export const digest = (tree, hash = sha256) => {
  if (Tag.is(tree)) {
    return hash(Tag.toBytes(tree))
  } else if (Reference.is(tree)) {
    return Reference.toDigest(tree)
  } else {
    const leaves = []
    for (const node of tree) {
      if (Bytes.is(node)) {
        leaves.push(node)
      } else {
        leaves.push(digest(node, hash))
      }
    }

    return fold(leaves, hash)
  }
}

/**
 * @param {Uint8Array[]} leaves
 * @param {Hash} hash
 */
export const fold = (leaves, hash = sha256) => {
  if (leaves.length === 0) {
    return hash(Null.toBytes(null))
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
        layer.push(hash(Bytes.concat(left, right)))
      }
      // Raise rightmost node to the next layer
      else {
        layer.push(left)
      }
    }
  }

  return layer[0]
}
