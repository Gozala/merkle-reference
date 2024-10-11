import * as Tag from './tag.js'

export const name = 'List'
export const tag = Tag.for('merkle-structure:list/item/ref-tree')

/**
 * @param {Set<unknown>} data
 * @param {(value: unknown) => unknown[]} toTree
 */
export const toTree = (data, toTree) => {
  const members = []
  for (const element of data) {
    members.push(toTree(element))
  }

  return [tag, members]
}
