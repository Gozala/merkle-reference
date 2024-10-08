/**
 * @param {unknown} data
 * @returns {boolean}
 */
export const isReference = (data) => {
  return data instanceof Reference
}

class Reference {
  /**
   * @param {Uint8Array} bytes
   */
  constructor(bytes) {
    this['merkle/reference'] = bytes
  }
}
