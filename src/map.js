import * as Tag from './tag.js'
import { compare } from './bytes.js'
import * as String from './string.js'

export const name = 'Map'
export const tag = Tag.for('merkle-structure:map/k+v/ref-tree')

/**
 * @param {Iterable<[unknown, unknown]>} entries
 * @param {import('./tree.js').Builder} builder
 * @return {import('./tree.js').Branch}
 */
export const attributes = (entries, builder) => {
  const attributes = []

  for (const [name, value] of entries) {
    const key = builder.toTree(name)
    const order =
      typeof name === 'string' ? String.toUTF8(name) : builder.digest(key)
    attributes.push({
      order: order,
      key,
      value: builder.toTree(value),
    })
  }

  return attributes
    .sort((left, right) => compare(left.order, right.order))
    .map(({ key, value }) => [key, value])
}

/**
 *
 * @param {Iterable<[unknown, unknown]>} entries
 * @param {import('./tree.js').Builder} builder
 */
export const from = (entries, builder) => [tag, attributes(entries, builder)]

/**
 * @param {object} data
 * @param {import('./tree.js').Builder} builder
 * @return {import('./tree.js').Branch}
 */
export const toTree = (data, builder) =>
  from(
    data instanceof Map
      ? data.entries()
      : data instanceof Set
        ? [...data].map((value) => [value, true])
        : Object.entries(data),
    builder
  )
