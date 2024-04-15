import { toTag } from './string.js'
import { compare } from './bytes.js'
import { compile } from './lib.js'

export const name = 'Map'
export const tag = 'merkle-structure:map/k+v/ref-tree'

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
 * @param {(value: unknown) => import('./lib.js').Node} toTree
 */
export const attributes = (data, toTree) => {
  const attributes = []
  for (const [key, value] of entries(data)) {
    attributes.push([toTree(key), toTree(value)])
  }

  return attributes.sort((left, right) =>
    compare(compile(left), compile(right))
  )
}

/**
 * @param {Map<unknown, unknown>} data
 * @param {(value: unknown) => import('./lib.js').Node} toTree
 */
export const toTree = (data, toTree) => {
  return [toTag(tag), attributes(data, toTree)]
}
