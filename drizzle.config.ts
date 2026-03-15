import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/supabase/schema.ts', // populated in Phase 4 (Forum)
  out: './supabase/migrations',
  dbCredentials: {
    // DIRECT_URL (port 5432) used for migrations — not the pooler
    url: process.env.DIRECT_URL!,
  },
})
