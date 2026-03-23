import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'
import { verifyToken } from '@/lib/newsletter/token'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  if (!email || !verifyToken(email, token)) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  // Fetch contact by email to get ID — safest across SDK versions
  const { data: contactList } = await resend.contacts.list({
    audienceId: process.env.RESEND_AUDIENCE_ID!,
  })
  const contact = contactList?.data?.find(
    (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
  )

  if (contact?.id) {
    await resend.contacts.update({
      audienceId: process.env.RESEND_AUDIENCE_ID!,
      id: contact.id,
      unsubscribed: false,
    })
  }

  redirect('/newsletter/confirmed')
}
