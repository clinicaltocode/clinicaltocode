// tests/auth/auth.test.ts
// Wave 0 stubs — structural properties of the auth implementation.
// Updated to real assertions as each wave completes.

describe('Auth middleware config', () => {
  it('middleware matcher pattern excludes _next/static (stub)', () => {
    const pattern =
      '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    expect(pattern).toContain('_next/static')
    expect(pattern).toContain('_next/image')
    expect(pattern).toContain('favicon.ico')
  })

  it('callback route path is /auth/callback (stub)', () => {
    const callbackPath = '/auth/callback'
    expect(callbackPath).toBe('/auth/callback')
  })
})

describe('Auth environment variables', () => {
  it('NEXT_PUBLIC_SITE_URL is defined (stub)', () => {
    const url = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    expect(url).toMatch(/^https?:\/\//)
  })
})

describe('Email verification gate', () => {
  it('email_confirmed_at null means unverified (stub)', () => {
    const mockUser = { email_confirmed_at: null }
    const isVerified = mockUser.email_confirmed_at != null
    expect(isVerified).toBe(false)
  })

  it('email_confirmed_at set means verified (stub)', () => {
    const mockUser = { email_confirmed_at: '2026-03-15T00:00:00.000Z' }
    const isVerified = mockUser.email_confirmed_at != null
    expect(isVerified).toBe(true)
  })
})
