import { NextResponse } from 'next/server'

export async function GET() {
  let supabaseStatus = 'unconfigured'
  let detail: string | undefined

  try {
    const { createClient } = await import('@/lib/supabase/server')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any
    const { error } = await supabase.from('_healthcheck').select('1').limit(1)
    // A "relation does not exist" error confirms PgBouncer connection succeeded
    const isConnected =
      !error ||
      error.code === 'PGRST116' ||
      (error.message?.includes('does not exist') ?? false)
    supabaseStatus = isConnected ? 'ok' : 'error'
    detail = error?.message
  } catch (err) {
    supabaseStatus = 'error'
    detail = err instanceof Error ? err.message : 'unknown error'
  }

  return NextResponse.json({ status: 'ok', supabase: supabaseStatus, detail })
}
