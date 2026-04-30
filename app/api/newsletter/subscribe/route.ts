import { Resend } from 'resend'
import { generateToken } from '@/lib/newsletter/token'

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const body = await request.json().catch(() => ({}))
  const email: string = body?.email ?? ''

  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Invalid email' }, { status: 400 })
  }

  // Add as unsubscribed contact — idempotent: duplicate contacts are ignored
  const { error: contactError } = await resend.contacts.create({
    audienceId: process.env.RESEND_AUDIENCE_ID!,
    email,
    unsubscribed: true,
  })

  // Ignore validation_error (duplicate contact) — re-send the confirmation email
  if (contactError && contactError.name !== 'validation_error') {
    return Response.json({ error: 'Failed to add contact' }, { status: 500 })
  }

  const token = generateToken(email)
  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?email=${encodeURIComponent(email)}&token=${token}`

  const { error: emailError } = await resend.emails.send({
    from: 'Clinical to Code <hello@clinicaltocode.com>',
    to: [email],
    subject: 'Confirm your subscription to Clinical to Code',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px;">Confirm your subscription</h1>
        <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 24px;">
          Click the link below to confirm your subscription to Clinical to Code.
        </p>
        <a href="${confirmUrl}" style="display: inline-block; background-color: #1a6847; color: #ffffff; font-size: 16px; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          Confirm my subscription
        </a>
        <p style="font-size: 14px; color: #666666; margin-top: 24px;">
          If you didn't sign up, you can safely ignore this email.
        </p>
      </div>
    `,
  })

  if (emailError) {
    return Response.json({ error: 'Failed to send confirmation email' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
