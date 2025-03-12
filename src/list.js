import * as Tag from './tag.js'

export const name = 'List'
export const tag = Tag.for('merkle-structure:list/item/ref-tree')

/**
 * @param {Set<unknown>} data
 * @param {import('./tree.js').Builder} builder
 */
export const toTree = (data, builder) => {
  const members = []
  for (const element of data) {
    members.push(builder.toTree(element))
  }

  return [tag, members]
}
