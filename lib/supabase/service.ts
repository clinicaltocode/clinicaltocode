import { createClient } from '@supabase/supabase-js'

// supabaseAdmin uses the service role key, which bypasses Row Level Security.
//
// CRITICAL RULES:
//   - Only instantiate on the server (Route Handlers, Server Actions, Server Components)
//   - NEVER import this file in client components or anything with 'use client'
//   - NEVER pass this client or its result across the server/client boundary
//   - SUPABASE_SERVICE_ROLE_KEY must never appear in client bundle
//
// The service role is required for CONT-04 thread creation because:
//   - The webhook is a server-to-server call with no authenticated user session
//   - RLS policies (Phase 4) will not cover service-role inserts
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
