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
      // Use on-demand revalidation via tags (webhook handler calls
      // revalidateTag), with a time-based fallback of 60s so the cache
      // still refreshes when content is added outside of webhooks
      // (e.g. seed scripts, direct API writes).
      revalidate: revalidate ?? 60,
      tags,
    },
  })
}
