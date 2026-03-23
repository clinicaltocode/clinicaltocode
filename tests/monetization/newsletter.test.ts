import { describe, it, expect } from 'vitest'
import { generateToken, verifyToken } from '@/lib/newsletter/token'

describe('newsletter HMAC token — generateToken / verifyToken', () => {
  it('generateToken returns a 64-char hex string', () => {
    const token = generateToken('user@example.com')
    expect(token).toMatch(/^[0-9a-f]{64}$/)
  })
  it('verifyToken returns true for correct token', () => {
    const token = generateToken('user@example.com')
    expect(verifyToken('user@example.com', token)).toBe(true)
  })
  it('verifyToken returns false for wrong token', () => {
    expect(verifyToken('user@example.com', 'a'.repeat(64))).toBe(false)
  })
  it('verifyToken returns false (not throw) for empty string', () => {
    expect(() => verifyToken('user@example.com', '')).not.toThrow()
    expect(verifyToken('user@example.com', '')).toBe(false)
  })
  it('verifyToken returns false (not throw) for odd-length hex', () => {
    expect(() => verifyToken('user@example.com', 'abc')).not.toThrow()
    expect(verifyToken('user@example.com', 'abc')).toBe(false)
  })
})
