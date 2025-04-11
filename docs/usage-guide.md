# Merkle Reference Usage Guide

This guide will help you understand when to use the merkle-reference library and when another approach might be more suitable.

## When to Use Merkle References

Merkle references provide unique benefits for specific use cases. You should consider using this library if you need at least one of the following properties:

### 1. Data Format Agnostic Addressing

If your application needs to identify data regardless of its encoding format (JSON, CBOR, custom formats), merkle-references provides consistent identifiers across encodings.

**Good fit when:**
- You work with the same logical data in multiple formats
- Data encoding might change over time
- You want content-addressable storage without being tied to specific encodings
- Users need to negotiate content encoding during data transfer

**Poor fit when:**
- Your data is always stored and transmitted in the same format
- Encoding flexibility provides no value to your application

### 2. Structural Sharing and Inclusion Proofs

If you need to prove that specific substructures exist within a larger data structure without revealing the entire dataset, merkle-references enables efficient verification.

**Good fit when:**
- You need to prove data inclusion without revealing the whole dataset
- Your application has shared substructures across different data objects
- Parts of your data need selective disclosure (zero-knowledge proofs)
- You're implementing trustless systems that require verification

**Poor fit when:**
- Your application doesn't require substructure verification
- No parts of your data structures are shared between objects

### 3. Chunked Transport with Integrity Verification

If you need to transport large datasets in chunks while enabling recipients to verify the integrity of each piece.

**Good fit when:**
- Working with large datasets that benefit from chunked transport
- Recipients need to verify chunk integrity independently
- You want flexible partitioning strategies not tied to identifier stability
- Network constraints require different chunking strategies

**Poor fit when:**
- Your data is small enough to transport in a single piece
- Integrity checking at the transport level is sufficient

### 4. Encoding Negotiation and Transformation

If you want to store data in one encoding but transport it in another, while maintaining verifiable content addressing.

**Good fit when:**
- Storage and transport encodings have different requirements
- You want to allow clients to request data in their preferred encoding
- Different consumers need different encodings of the same logical data

**Poor fit when:**
- One encoding is suitable for all use cases
- The flexibility doesn't justify the processing overhead

## Performance Considerations

### Granularity Trade-offs

The granularity of your data has a significant impact on the performance and value of using merkle-references:

- **Very granular data** (millions of tiny objects): The cost of referencing will be high since each item must be hashed individually
- **Coarse data** (fewer, larger objects): The overhead of using merkle-references over a regular hash function is relatively low

### Finding the Right Balance

You don't need to choose between the extremes of:
1. Hashing the entire encoded dataset as a single unit, or
2. Using merkle-references on every minute piece of data

Instead, consider a hybrid approach where:

- Use merkle-references for the parts of your data that benefit from its properties
- Use more coarse-grained approaches for parts that don't benefit
- For complex structures like virtual DOM trees, consider mapping to a more compact representation before deriving references

#### Implementing Custom Reference Strategies

A good pattern is to define a `.refer()` method for your data types. This method can determine how to map the data before passing it to the `refer` function from this library.

Here are some examples showing different strategies:

##### Example 1: Coarse Approach (When Merkle Properties Aren't Needed)

When you don't need any of the merkle-reference properties, you can simply serialize the data:

```javascript
import { refer } from 'merkle-reference'

class UserProfile {
  constructor(id, details, activityLog) {
    this.id = id
    this.details = details
    this.activityLog = activityLog // large array of activity entries
  }

  refer() {
    // We don't need merkle properties for this data, so serialize first
    return refer(JSON.stringify(this))
  }
}
```

This approach is efficient when you don't need structural verification or encoding flexibility.

##### Example 2: Fine-Grained Approach (Full Merkle Properties)

When you need all the benefits of merkle-references:

```javascript
import { refer } from 'merkle-reference'

class Document {
  constructor(metadata, content, signatures) {
    this.metadata = metadata
    this.content = content
    this.signatures = signatures
  }

  refer() {
    // Pass the structure directly to get full merkle benefits
    return refer({
      metadata: this.metadata,
      content: this.content,
      signatures: this.signatures
    })
  }
}
```

This approach enables inclusion proofs, encoding flexibility, and structural verification.

##### Example 3: Hybrid Approach (Balanced Performance)

When you need merkle properties for some parts but not others:

```javascript
class UserProfile {
  constructor(id, details, activityLog) {
    this.id = id
    this.details = details
    this.activityLog = activityLog // large array of activity entries
  }

  refer() {
    // We don't need merkle properties for this data, so serialize first
    return refer({
      id: this.id,
      details: this.details,
      activityLog: refer({
        'application/json': JSON.stringify(this.activityLog)
      })
    })
  }
}
```

This hybrid approach lets you optimize performance while preserving merkle properties where needed.

##### Example 4: Customized Virtual DOM Example

For complex nested structures like virtual DOM trees:

```javascript
import { refer } from 'merkle-reference'

class VirtualDOM {
  constructor(tree) {
    this.tree = tree // complex nested structure
  }

  refer() {
    // Custom function to map the DOM to a more compact form
    const simplifiedTree = this.mapTreeToSimplifiedForm(this.tree)
    return refer(simplifiedTree)
  }

  mapTreeToSimplifiedForm(node) {
    if (!node) return null

    // Text nodes can be passed directly
    if (typeof node === 'string') return node

    // For elements with many identical children (like lists),
    // we can create a template once and reference it
    if (this.hasRepetitiveChildren(node)) {
      return {
        type: node.type,
        props: node.props,
        childTemplate: this.mapTreeToSimplifiedForm(node.children[0]),
        childCount: node.children.length
      }
    }

    // Regular elements get mapped recursively
    return {
      type: node.type,
      props: node.props,
      children: node.children.map(child => this.mapTreeToSimplifiedForm(child))
    }
  }

  hasRepetitiveChildren(node) {
    // Logic to detect repetitive children
    // ...
  }
}
```

In this example, repetitive structures are compressed before generating references, improving performance while maintaining the merkle properties for the overall structure.

#### Guidelines for Finding Your Balance

1. **Start with identifying which parts of your data need which merkle properties**
   - Which parts need inclusion proofs?
   - Which parts need encoding flexibility?
   - Which parts are shared between structures?

2. **Consider the access patterns**
   - How will consumers access the data?
   - What verification needs to happen?
   - What parts are accessed together vs. independently?

3. **Measure performance impacts**
   - Test with real-world data volumes
   - Compare different granularity approaches
   - Find the sweet spot for your specific use case

4. **Implement specialized `.refer()` methods for your data types**
   - This creates a clean abstraction for reference generation
   - Makes it easy to adjust strategies as requirements change
   - Centralizes reference logic for each data type

## Example Use Cases

### Good Fits

- **Distributed content-addressed storage systems** that need encoding flexibility
- **Verifiable data structures** in trustless environments
- **Data synchronization protocols** that can benefit from partial updates
- **Content distribution networks** where different clients may request different encodings
- **Zero-knowledge proof systems** that require selective disclosure

### Poor Fits

- **Simple key-value stores** with fixed encoding
- **High-throughput systems** where the reference computation overhead isn't justified
- **Extremely granular datasets** where hashing overhead would be prohibitive
- **Applications without any need for verification, encoding flexibility, or partial data access**

## Incremental Reference Derivation

An interesting opportunity with merkle-references is incremental reference derivation, which can be an efficient way to index data in an encoding-agnostic way. This approach allows you to:

- Build references as data is being constructed
- Avoid redundant computation when deriving references for similar structures
- Create encoding-agnostic indexes for your data

Here's an example of how you might implement incremental reference derivation using a hybrid approach:

```javascript
import { refer } from 'merkle-reference'

class Document {
  constructor() {
    this.sections = []
    this.metadata = { title: "", author: "", lastModified: null }
  }
  
  addSection(section) {
    this.sections.push(section)
    return this.sections.length - 1
  }
  
  updateSection(index, newContent) {
    if (index >= this.sections.length) throw new Error('Section index out of bounds')
    this.sections[index] = newContent
  }
  
  updateMetadata(updates) {
    this.metadata = { ...this.metadata, ...updates, lastModified: new Date() }
  }
  
  // Apply a hybrid approach to generating references
  refer() {
    // For metadata, we want full merkle benefits
    // For sections, apply different strategies based on content type
    
    const processedSections = this.sections.map(section => {
      if (section.type === 'text') {
        // For text, use the full structure to benefit from all merkle properties
        return section
      } else if (section.type === 'image') {
        // For binary data like images, we don't need internal structure
        return {
          type: 'image',
          metadata: section.metadata,
          // Store the image data as a format-specific reference
          data: refer({
            [`image/${section.format}`]: section.rawData
          })
        }
      } else if (section.type === 'table' && section.rows.length > 100) {
        // For large tables, use a more compact representation
        return {
          type: 'table',
          schema: section.schema,
          // Store large tables as serialized data
          rows: refer({
            'application/json': JSON.stringify(section.rows)
          })
        }
      }
      // For other section types, use full merkle structure
      return section
    })
    
    // Generate the reference with our hybrid structure
    return refer({
      metadata: this.metadata,
      sections: processedSections
    })
  }
}
```

This hybrid approach demonstrates several key patterns:

1. **Direct References**: For critical metadata, use the full merkle structure to benefit from all properties
2. **Format-Specific References**: For binary or large data, create references to format-specific serializations
3. **Selective Processing**: Apply different strategies based on content type and size
4. **Incremental Computation**: Generate references only when needed, not on every update

The primary benefit of this approach is that you can incrementally build and derive references for complex documents while optimizing the processing overhead. You choose which parts benefit most from the full merkle properties and which parts are better served by more compact representations.

## Conclusion

Merkle references provide powerful capabilities for content addressing that goes beyond simple hashing. The library offers flexibility in data encoding, partitioning, and verification that traditional content addressing systems lack.

However, these benefits come with computational costs. To make the most of merkle-references, ensure your use case truly needs at least one of its unique properties, and consider the granularity of your data when implementing your solution.

If you're unsure whether your use case benefits from merkle-references, start by identifying which of the core properties (format agnosticism, inclusion proofs, chunked transport, or encoding negotiation) would provide concrete value to your application.
