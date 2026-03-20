import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sanity/client'],
  images: {
    remotePatterns: [
      { hostname: '*.supabase.co' },
      { hostname: 'cdn.sanity.io' },
    ],
  },
  webpack(config, { isServer }) {
    // @sanity/vision ships ESM-only and uses useEffectEvent from React 19.2+.
    // Next.js 15 aliases 'react' to its own internal compiled bundle which is
    // an older React version that does not export useEffectEvent.
    // Override the alias to use the project's own React 19.2.4 so that
    // @sanity/vision (Studio route only) can resolve the hook.
    // This only affects the client bundle — server rendering is unaffected.
    if (!isServer) {
      const reactPath = path.resolve('./node_modules/react')
      const reactDomPath = path.resolve('./node_modules/react-dom')
      config.resolve.alias = {
        ...config.resolve.alias,
        react: reactPath,
        'react-dom': reactDomPath,
      }
    }
    return config
  },
}

export default nextConfig
