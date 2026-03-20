import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'
import { client } from './fetch'

const imageBuilder = createImageUrlBuilder(client)

// Pass the entire coverImage object (including crop and hotspot subfields),
// not just coverImage.asset. The builder needs those to apply focal-point
// cropping correctly. See RESEARCH.md Pitfall 9.4.
export function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source)
}
