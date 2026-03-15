import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

// CRITICAL: prepare: false is required for PgBouncer transaction mode.
// PgBouncer does not support prepared statements.
// See PITFALLS.md Pitfall 1 and STACK.md Key Decision 1.
// DATABASE_URL must use port 6543 (pooler), not port 5432 (direct).
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
})

export const db = drizzle(client)
