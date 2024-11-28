import * as Tag from './tag.js'
import { compare } from './bytes.js'
import * as String from './string.js'
import * as Tree from './tree.js'

export const name = 'Map'
export const tag = Tag.for('merkle-structure:map/k+v/ref-tree')

/**
 * @param {object} data
 */
export function* entries(data) {
  if (data instanceof Map) {
    yield* data.entries()
  } else if (data instanceof Set) {
    for (const value of data.values()) {
      yield [value, true]
    }
  } else {
    yield* Object.entries(data)
  }
}

/**
 * @param {object} data
 * @param {(value: unknown) => Tree.Node} toTree
 */
export const attributes = (data, toTree) => {
  const attributes = []
  for (const [name, value] of entries(data)) {
    const key = toTree(name)
    const order =
      typeof name === 'string' ? String.toUTF8(name) : Tree.digest(key)
    attributes.push({
      order: order,
      key,
      value: toTree(value),
    })
  }

  return attributes
    .sort((left, right) => compare(left.order, right.order))
    .map(({ key, value }) => [key, value])
}

/**
 * @param {Map<unknown, unknown>} data
 * @param {(value: unknown) => Tree.Node} toTree
 */
export const toTree = (data, toTree) => {
  return [tag, attributes(data, toTree)]
}
