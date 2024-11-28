# Merkle Reference

This is a TS library implementing [merkle reference] specification.

## Abstract

Merkle references is a [cryptographic hash function] like [SHA-2] or [Blake 3] but defined not just for binary input, but generalized for arbitrary data structures.

As such it provides canonical cryptographic addressing scheme for any data without imposing on disk or wire serialization format. In many ways it is similar to [content identifiers (CIDs)][CID] from IPFS, but it attempts to overcome various limitations as described by a [specification][merkle reference].

## Usage

```ts
import { refer } from "merkle-reference"

const message = refer({ hello: "world" })
message.toString()
//> ba4jcbvpq3k5sooggkwwosy6sqd3fhr5md7hroyf3bq3vrambqm4xkkus


// You can also incrementally build a reference using
// references
const linked = refer({
  to: "merkle@reference.link",
  message
})

// Resulting reference will be the same as when everything
// was inlined
const inline = {
  to: "merkle@reference.link",
  message: {
    hello: "world"
  }
}

linked.toString() === refer(inline).toString() // true
```

## IPLD Integration

Merkle references are intentionally implemented to be type compatible with [IPLD Link]s / [CID]s and therefor can be used with [multiformats] library and all the IPLD codecs.

### IPLD Link

Merkle reference when prefixed with CIDv1 prefix can be interpreted as valid [IPLD Link] for data encoded per [merkle reference] specification.

### Multihash

Merkle reference without CIDv1 prefix can be interpreted as higher-order [multihash] which hashes arbitrary data structures per [merkle reference] specification.

### Multiformat

Merkle reference can also be interpreted as it's own multiformat per [merkle reference] specification.

[merkle reference]:./docs/spec.md
[SHA-2]:https://en.wikipedia.org/wiki/SHA-2
[Blake 3]:https://blake3.io
[cryptographic hash function]:https://en.wikipedia.org/wiki/Cryptographic_hash_function
[CID]:https://docs.ipfs.tech/concepts/content-addressing/
[IPLD Link]:https://ipld.io/docs/schemas/features/links/
[multiformats]:https://github.com/multiformats/js-multiformats
[multihash]:https://github.com/multiformats/multihash
[multiformat]:https://github.com/multiformats/multiformats
