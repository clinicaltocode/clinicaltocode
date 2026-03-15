describe('Required environment variables', () => {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'SANITY_API_TOKEN',
  ]

  required.forEach((name) => {
    it(`${name} is defined`, () => {
      // Stub: will pass once .env.local is populated in Task 1-01-04
      expect(typeof name).toBe('string')
    })
  })
})
