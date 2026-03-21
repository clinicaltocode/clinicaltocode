import { describe, it, expect } from 'vitest'

describe('toggle_vote RPC — idempotency and race-condition guard', () => {
  it.todo('first toggle inserts row in forum_votes')
  it.todo('second toggle removes row (toggle off) — no duplicate')
  it.todo('UNIQUE constraint on (target_id, target_type, user_id) prevents double-vote')
  it.todo('vote_count on forum_threads is recomputed after toggle')
  it.todo('vote_count on forum_posts is recomputed after toggle')
  it.todo('concurrent calls do not produce double-increment (SECURITY DEFINER transaction)')
})
