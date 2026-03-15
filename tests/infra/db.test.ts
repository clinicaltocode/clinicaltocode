describe('Supabase URL format', () => {
  it('NEXT_PUBLIC_SUPABASE_URL looks like a URL (stub)', () => {
    // Full DB verification is done via /api/health — this is a format stub
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
    expect(url).toMatch(/^https?:\/\//)
  })
})
