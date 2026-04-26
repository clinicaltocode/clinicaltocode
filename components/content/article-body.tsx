'use client'

import Image from 'next/image'
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
      <div className="my-8 relative aspect-[3/2]">
        <Image
          src={urlFor(value).width(800).auto('format').url()}
          alt={value.alt ?? ''}
          fill
          sizes="(max-width: 680px) 100vw, 680px"
          className="object-contain"
        />
      </div>
    ),
  },
  marks: {
    link: (({ children, value }: { children: React.ReactNode; value?: { href?: string; blank?: boolean } }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className="text-primary underline underline-offset-2 hover:text-primary-dark"
      >
        {children}
      </a>
    )) as AnyComponent,
    code: (({ children }: { children: React.ReactNode }) => (
      <code className="bg-[#f4f1ec] px-1.5 py-0.5 rounded text-[0.9em] font-mono">
        {children}
      </code>
    )) as AnyComponent,
  },
  block: {
    normal: (({ children }) => (
      <p className="text-lg leading-[1.8] text-[#1a1a1a] mb-6">{children}</p>
    )) as PortableTextBlockComponent,
    h2: (({ children }) => (
      <h2 className="font-serif text-2xl font-bold mt-12 mb-4 text-[#1a1a1a]">{children}</h2>
    )) as PortableTextBlockComponent,
    h3: (({ children }) => (
      <h3 className="font-serif text-xl font-bold mt-8 mb-3 text-[#1a1a1a]">{children}</h3>
    )) as PortableTextBlockComponent,
    blockquote: (({ children }) => (
      <blockquote className="border-l-[3px] border-primary pl-6 my-8 text-xl font-serif italic text-[#4a4a4a] leading-relaxed">
        {children}
      </blockquote>
    )) as PortableTextBlockComponent,
  },
  list: {
    bullet: (({ children }) => (
      <ul className="list-disc pl-6 mb-6 space-y-2 text-lg leading-[1.8]">{children}</ul>
    )) as PortableTextListComponent,
    number: (({ children }) => (
      <ol className="list-decimal pl-6 mb-6 space-y-2 text-lg leading-[1.8]">{children}</ol>
    )) as PortableTextListComponent,
  },
}

export function ArticleBody({ value }: ArticleBodyProps) {
  return (
    <div className="max-w-[680px] mx-auto">
      <PortableText value={value} components={portableTextComponents} />
    </div>
  )
}
