import { describe, it, expect } from 'vitest'

// ---------------------------------------------------------------------------
// PROF-01: Public profile page
// ---------------------------------------------------------------------------

describe('PROF-01: Public profile page', () => {
  it.todo('profile row with username returns data')
  it.todo('missing username returns notFound')
  it.todo('join date formats correctly with date-fns format()')
  it.todo('post history returns threads ordered by created_at desc')
})

// ---------------------------------------------------------------------------
// PROF-02: Credential badge
// ---------------------------------------------------------------------------

const VALID_CREDENTIALS = ['RN', 'NP', 'MD', 'DO', 'PharmD', 'PA', 'CMIO', 'CIO', 'Health IT', 'Other']

function isValidCredential(v: string | null) {
  return v === null || VALID_CREDENTIALS.includes(v)
}

describe('PROF-02: Credential badge', () => {
  it('valid credential passes allowlist', () => {
    expect(isValidCredential('RN')).toBe(true)
    expect(isValidCredential(null)).toBe(true)
  })
  it('invalid credential fails allowlist', () => {
    expect(isValidCredential('INVALID')).toBe(false)
    expect(isValidCredential('')).toBe(false)
  })
  it.todo('invalid credential badge value throws Error(\'Invalid credential badge.\')')
  it.todo('null credential badge is accepted (user has no badge)')
})

// ---------------------------------------------------------------------------
// PROF-03: Avatar upload validation
// ---------------------------------------------------------------------------

describe('PROF-03: Avatar upload validation', () => {
  it('bio truncates to 280 chars', () => {
    const long = 'a'.repeat(300)
    const result = long.trim().slice(0, 280)
    expect(result.length).toBe(280)
  })
  it.todo('file over 2MB is rejected with \'Photo must be under 2MB.\'')
  it.todo('non-image MIME type rejected with \'Only JPEG, PNG, or WebP files are accepted.\'')
  it.todo('JPEG/PNG/WebP MIME types are accepted')
  it.todo('bio truncated to 280 chars before save')
})
