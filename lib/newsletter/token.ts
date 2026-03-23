import { createHmac, timingSafeEqual } from 'crypto'

export function generateToken(email: string): string {
  return createHmac('sha256', process.env.NEWSLETTER_TOKEN_SECRET!)
    .update(email)
    .digest('hex')
}

export function verifyToken(email: string, token: string): boolean {
  const expected = generateToken(email)
  try {
    return timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expected, 'hex')
    )
  } catch {
    return false
  }
}
