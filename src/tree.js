import { sha256 } from '@noble/hashes/sha256'
import * as Tag from './tag.js'
import * as Bytes from './bytes.js'
import * as Null from './null.js'
import * as Reference from './reference.js'
import * as Type from './type.js'

import { base32 } from './reference.js'

export { sha256 }

export class StrictTraversal {
  /**
   * @param {object} source
   * @returns {Iterable<[string, unknown]|[number, unknown]>}
   */
  static *entries(source) {
    if (source instanceof Map) {
      yield* source.entries()
    } else if (source instanceof Set) {
      for (const value of source.values()) {
        yield [value, true]
      }
    } else if (Array.isArray(source)) {
      yield* source.entries()
    } else {
      yield* Object.entries(source)
    }
  }
}

/**
 * @param {unknown} value
 */
const toJSON = (value) => {
  switch (value) {
    case Infinity:
    case -Infinity:
      return undefined
    default: {
      switch (typeof value) {
        case 'function':
        case 'undefined':
        case 'symbol':
          return undefined
        case 'number':
          return isNaN(/** @type {number} */ (value)) ? undefined : value
        case 'object': {
          if (
            typeof (/** @type {{toJSON?:unknown}} */ (value)?.toJSON) ==
            'function'
          ) {
            return /** @type {{toJSON?:unknown}} */ (value).toJSON()
          } else if (value instanceof String) {
            return `${value}`
          } else if (value instanceof Boolean) {
            return value.valueOf()
          } else if (value instanceof Number) {
            return toJSON(value.valueOf())
          } else {
            return value
          }
        }
        default: {
          return value
        }
      }
    }
  }
}

export class JSONTraversal {
  /**
   * @param {{toJSON?: unknown}} source
   * @returns {Iterable<[string, unknown]|[number, unknown]>}
   */
  static *entries(source) {
    const object = toJSON(source)

    if (Array.isArray(object)) {
      // If it is an array we substitute non-json members with null to match
      // what JSON.stringify does there.
      for (const [at, value] of object.entries()) {
        const json = toJSON(value)
        yield [at, json === undefined ? null : json]
      }
    } else {
      for (const [at, value] of StrictTraversal.entries(object)) {
        const json = toJSON(value)
        if (json !== undefined) {
          yield [/** @type {string} */ (at), json]
        }
      }
    }
  }
}

/**
 * @typedef {Uint8Array} Leaf
 * @typedef {Array<Leaf|Node>} Branch
 * @typedef {symbol|Branch} Node
 * @typedef {(payload: Uint8Array) => Uint8Array} Hash
 *
 * @typedef {object} Builder
 * @property {(source: unknown) => Node} toTree
 * @property {(source: object) => Iterable<[string|number, unknown]>} entries
 * @property {(node: Node) => Uint8Array} digest
 * @property {<T>(sounce: T) => Reference.View<T>} refer
 * @property {(source: unknown) => string} id
 */

class TreeBuilder {
  /**
   * @param {Hash} hash
   * @param {Builder['entries']} entries
   * @param {WeakMap<object, Node>} nodes
   * @param {WeakMap<Node, Uint8Array>} digests
   */
  constructor(
    hash,
    entries = StrictTraversal.entries,
    nodes = new WeakMap(),
    digests = new WeakMap()
  ) {
    this.hash = hash
    this.entries = entries
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
      const type = Type.infer(source)
      // @ts-expect-error
      node = /** @type {Node} */ (type.toTree(source, this))

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
 * @param {Builder['entries']} [entries]
 */
export const createBuilder = (hash, entries) => new TreeBuilder(hash, entries)
