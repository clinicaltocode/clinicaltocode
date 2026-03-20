'use client'

// ArticleBody must be a Client Component because PortableText uses hooks
// internally. The `value` prop is plain JSON (serializable) so it can be
// passed from the Server Component parent with no issues.
//
// portableTextComponents is defined outside the component to prevent
// the object reference from changing on every render pass.

import { PortableText } from '@portabletext/react'
import type {
  PortableTextBlock,
  PortableTextReactComponents,
  PortableTextListComponent,
  PortableTextBlockComponent,
} from '@portabletext/react'
import { urlFor } from '@/lib/sanity/image'

interface ArticleBodyProps {
  value: PortableTextBlock[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = any

const portableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    image: ({ value }: { value: { alt?: string; crop?: unknown; hotspot?: unknown; asset?: { url?: string } } }) => (
      <img
        src={urlFor(value).width(800).auto('format').url()}
        alt={value.alt ?? ''}
        className="rounded-xl my-6 w-full"
      />
    ),
  },
  marks: {
    link: (({ children, value }: { children: React.ReactNode; value?: { href?: string; blank?: boolean } }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className="text-primary underline hover:text-primary-dark"
      >
        {children}
      </a>
    )) as AnyComponent,
    code: (({ children }: { children: React.ReactNode }) => (
      <code className="bg-gray-100 px-1 py-1 rounded text-sm font-mono">
        {children}
      </code>
    )) as AnyComponent,
  },
  block: {
    normal: (({ children }) => (
      <p className="text-base leading-relaxed text-[#1a1a1a] mb-4">{children}</p>
    )) as PortableTextBlockComponent,
    h2: (({ children }) => (
      <h2 className="text-xl font-semibold mt-8 mb-3 text-[#1a1a1a]">{children}</h2>
    )) as PortableTextBlockComponent,
    h3: (({ children }) => (
      <h3 className="text-xl font-semibold mt-6 mb-2 text-[#1a1a1a]">{children}</h3>
    )) as PortableTextBlockComponent,
    blockquote: (({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-[#666666]">
        {children}
      </blockquote>
    )) as PortableTextBlockComponent,
  },
  list: {
    bullet: (({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
    )) as PortableTextListComponent,
    number: (({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
    )) as PortableTextListComponent,
  },
}

export function ArticleBody({ value }: ArticleBodyProps) {
  return (
    <div className="max-w-[720px] mx-auto">
      <PortableText value={value} components={portableTextComponents} />
    </div>
  )
}
