import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/forum/utils'

describe('FORUM-01: Public browsing — no auth required', () => {
  it.todo('categories are publicly readable via RLS SELECT policy')
  it.todo('threads are publicly readable via RLS SELECT policy')
  it.todo('posts are publicly readable via RLS SELECT policy')
})

describe('FORUM-02: Verified user can create thread', () => {
  it('derives slug server-side from title', () => {
    expect(slugify('Hello World! Test')).toBe('hello-world-test')
    expect(slugify('  leading/trailing  ')).toBe('leading-trailing')
    expect(slugify('a'.repeat(100)).length).toBeLessThanOrEqual(80)
    expect(slugify('')).toBe('')
  })
  it.todo('RLS INSERT policy requires email_confirmed_at IS NOT NULL')
  it.todo('RLS INSERT policy requires auth.uid() = author_id')
})

describe('FORUM-03: 2-level reply nesting', () => {
  it.todo('createPost rejects depth > 1 (parent_post.depth === 1)')
  it.todo('depth=0 post is top-level, depth=1 post is reply')
})

describe('FORUM-04: Upvote toggle semantics', () => {
  it.todo('toggle_vote inserts a row on first call')
  it.todo('toggle_vote removes the row on second call (toggle off)')
  it.todo('vote_count reflects forum_votes COUNT(*) after toggle')
})

describe('FORUM-05: 5 clinical specialty categories seeded', () => {
  it.todo('forum_categories contains Nursing, EHR, Clinical Informatics, Pharmacy, Physician Perspectives')
  it.todo('each category has a unique slug matching the seed data')
})

describe('FORUM-06: Bookmark unique per user per thread', () => {
  it.todo('UNIQUE constraint on (thread_id, user_id) in forum_bookmarks')
  it.todo('RLS SELECT policy only returns bookmarks for auth.uid()')
})
