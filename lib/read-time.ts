interface PortableTextSpan {
  _type: string
  text?: string
}

interface PortableTextBlock {
  _type: string
  children?: PortableTextSpan[]
}

// estimateReadTime counts words across all block-type nodes in a
// PortableText array and divides by 200 (average adult reading speed).
// Returns at least 1 minute.
//
// Only call this on the detail page where the full body is fetched.
// Never call on the index page — body is not projected there.
export function estimateReadTime(blocks: PortableTextBlock[]): number {
  const text = blocks
    .filter(b => b._type === 'block')
    .flatMap(b => b.children ?? [])
    .map(span => span.text ?? '')
    .join(' ')

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  return Math.max(1, Math.ceil(wordCount / 200))
}
