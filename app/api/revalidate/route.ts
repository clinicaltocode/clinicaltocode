import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = process.env.REVALIDATION_TOKEN

  if (!token || authHeader !== `Bearer ${token}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tag } = await request.json() as { tag?: string }
  const tags = tag ? [tag] : ['article', 'category']

  for (const t of tags) {
    revalidateTag(t)
  }

  return Response.json({ revalidated: tags, now: Date.now() })
}
