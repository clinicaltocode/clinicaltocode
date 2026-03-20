import { createClient } from 'next-sanity'
import { cache } from 'react'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

// Wrap client.fetch with React cache() so identical queries within a single
// render pass are deduplicated — no extra network round-trips.
const clientFetch = cache(client.fetch.bind(client))

export async function sanityFetch<T>({
  query,
  params    = {},
  tags      = [],
  revalidate,
}: {
  query:       string
  params?:     Record<string, unknown>
  tags?:       string[]
  revalidate?: number | false
}): Promise<T> {
  return clientFetch(query, params, {
    cache: 'force-cache',
    next: {
      // When tags are provided, disable time-based revalidation and rely
      // solely on on-demand revalidation via revalidateTag() in the
      // webhook handler. Without tags, fall back to ISR every 60s.
      revalidate: tags.length ? false : (revalidate ?? 60),
      tags,
    },
  })
}
