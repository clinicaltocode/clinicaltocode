// Shared test setup — extend as needed per phase

// Set required env vars for unit tests that exercise crypto/token utilities
process.env.NEWSLETTER_TOKEN_SECRET = process.env.NEWSLETTER_TOKEN_SECRET ?? 'test-secret-for-unit-tests-only'
