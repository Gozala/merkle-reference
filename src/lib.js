import { sha256 } from '@noble/hashes/sha256'
import * as Null from './null.js'
import * as String from './string.js'
import * as Boolean from './boolean.js'
import * as Integer from './integer.js'
import * as Float from './float.js'
import * as Bytes from './bytes.js'
import * as List from './list.js'
import * as Map from './map.js'
import { base32 } from 'multiformats/bases/base32'

export { sha256, base32, Null, String, Boolean, Integer, Float }

class View {}

/**
 * @param {unknown} data
 */
export const infer = (data) => {
  switch (typeof data) {
    case 'number':
      return Number.isInteger(data) ? Integer : Float
    case 'bigint':
      return Integer
    case 'boolean':
      return Boolean
    case 'string':
      return String
    case 'object': {
      if (data === null) {
        return Null
      } else if (data instanceof Uint8Array) {
        return Bytes
      } else if (Array.isArray(data)) {
        return List
        // } else if (data instanceof View) {
        //   return data
      } else {
        return Map
      }
    }
    default: {
      throw new TypeError(`Unknown type ${data}`)
    }
  }
}

/**
 *
 * @param {unknown} data
 * @returns {Node}
 */
export const toTree = (data) => {
  const type = infer(data)
  // @ts-expect-error
  return type.toTree(data, toTree)
}

/**
 * @param {Uint8Array[]} leaves
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
      } else {
        layer.push(left)
      }
    }
  }

  return layer[0]
}

/**
 * @typedef {Uint8Array} Leaf
 * @typedef {Array<Leaf|Node>} Node


/**
 * @param {Node} tree
 * @returns {Uint8Array}
 */
export const compile = (tree, hash = sha256) => {
  // if (tree.length === 1) {
  //   const [node] = tree
  //   if (node instanceof Uint8Array) {
  //     return hash(node)
  //   } else {
  //     return hash(compile(node, hash))
  //   }
  // }

  const leaves = []
  for (const node of tree) {
    if (node instanceof Uint8Array) {
      leaves.push(node)
    } else {
      leaves.push(compile(node, hash))
    }
  }

  return fold(leaves, hash)
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export const id = (value, hash = sha256) =>
  base32.encode(compile(toTree(value), hash))
