-- Migration: add_forum_write_tables (Phase 4)
-- Adds forum_posts, forum_votes, forum_bookmarks tables.
-- Alters forum_threads to add vote_count, reply_count, is_removed, and author_id FK.
-- Creates toggle_vote SECURITY DEFINER RPC.
-- Enables RLS on all 4 forum tables with full policy set.
-- Requires: 20260316000000_add_forum_tables.sql (Phase 3)

-- ---------------------------------------------------------------------------
-- Alter forum_threads — add Phase 4 columns
-- ---------------------------------------------------------------------------
ALTER TABLE forum_threads
  ADD COLUMN IF NOT EXISTS vote_count  INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reply_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_removed  BOOLEAN NOT NULL DEFAULT false;

-- Add FK from author_id to auth.users (Phase 3 had it as bare UUID)
ALTER TABLE forum_threads
  DROP CONSTRAINT IF EXISTS forum_threads_author_id_fkey;
ALTER TABLE forum_threads
  ADD CONSTRAINT forum_threads_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Indexes for category thread list queries
CREATE INDEX IF NOT EXISTS idx_threads_category_created
  ON forum_threads(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_category_votes
  ON forum_threads(category_id, vote_count DESC);

-- ---------------------------------------------------------------------------
-- forum_posts — replies and nested replies (max depth = 1)
-- ---------------------------------------------------------------------------
CREATE TABLE forum_posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id      UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body           TEXT NOT NULL,
  vote_count     INT NOT NULL DEFAULT 0,
  depth          SMALLINT NOT NULL DEFAULT 0,
  is_removed     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT forum_posts_depth_check CHECK (depth <= 1)
);

-- Indexes for the three-query thread detail fetch
CREATE INDEX idx_posts_thread_created ON forum_posts(thread_id, created_at ASC)
  WHERE parent_post_id IS NULL;
CREATE INDEX idx_posts_parent ON forum_posts(parent_post_id, created_at ASC)
  WHERE parent_post_id IS NOT NULL;

-- updated_at trigger (reuse trigger function from Phase 3)
CREATE TRIGGER forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- forum_votes — polymorphic upvote table (threads and posts)
-- ---------------------------------------------------------------------------
CREATE TABLE forum_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id   UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('thread', 'post')),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (target_id, target_type, user_id)
);

CREATE INDEX idx_votes_target ON forum_votes(target_id, target_type);

-- ---------------------------------------------------------------------------
-- forum_bookmarks — one bookmark per user per thread
-- ---------------------------------------------------------------------------
CREATE TABLE forum_bookmarks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (thread_id, user_id)
);

CREATE INDEX idx_bookmarks_user ON forum_bookmarks(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- toggle_vote — atomic SECURITY DEFINER RPC
-- Handles upsert + toggle + denormalized count update in one transaction.
-- Called via supabase.rpc('toggle_vote', { p_target_id, p_target_type, p_user_id })
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION toggle_vote(
  p_target_id   UUID,
  p_target_type TEXT,
  p_user_id     UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id UUID;
BEGIN
  SELECT id INTO existing_id
  FROM forum_votes
  WHERE target_id = p_target_id
    AND target_type = p_target_type
    AND user_id = p_user_id;

  IF existing_id IS NOT NULL THEN
    DELETE FROM forum_votes WHERE id = existing_id;
  ELSE
    INSERT INTO forum_votes (target_id, target_type, user_id)
    VALUES (p_target_id, p_target_type, p_user_id);
  END IF;

  IF p_target_type = 'thread' THEN
    UPDATE forum_threads
    SET vote_count = (
      SELECT COUNT(*) FROM forum_votes
      WHERE target_id = p_target_id AND target_type = 'thread'
    )
    WHERE id = p_target_id;
  ELSE
    UPDATE forum_posts
    SET vote_count = (
      SELECT COUNT(*) FROM forum_votes
      WHERE target_id = p_target_id AND target_type = 'post'
    )
    WHERE id = p_target_id;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- RLS — Enable and set policies on all 4 forum tables
-- ---------------------------------------------------------------------------

-- forum_categories (already exists — add RLS only)
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories are publicly readable" ON forum_categories;
CREATE POLICY "categories are publicly readable"
  ON forum_categories FOR SELECT USING (true);

-- forum_threads
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "threads are publicly readable" ON forum_threads;
CREATE POLICY "threads are publicly readable"
  ON forum_threads FOR SELECT USING (true);

DROP POLICY IF EXISTS "verified users can create threads" ON forum_threads;
CREATE POLICY "verified users can create threads"
  ON forum_threads FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    (SELECT email_confirmed_at FROM auth.users WHERE id = auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "authors can update own threads" ON forum_threads;
CREATE POLICY "authors can update own threads"
  ON forum_threads FOR UPDATE
  USING (auth.uid() = author_id);

-- forum_posts
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts are publicly readable"
  ON forum_posts FOR SELECT USING (true);

CREATE POLICY "verified users can create posts"
  ON forum_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    (SELECT email_confirmed_at FROM auth.users WHERE id = auth.uid()) IS NOT NULL
  );

CREATE POLICY "authors can update own posts"
  ON forum_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- forum_votes
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes are publicly readable"
  ON forum_votes FOR SELECT USING (true);

CREATE POLICY "authenticated users can vote"
  ON forum_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can remove own votes"
  ON forum_votes FOR DELETE
  USING (auth.uid() = user_id);

-- forum_bookmarks (private — owner only)
ALTER TABLE forum_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can see own bookmarks"
  ON forum_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can create own bookmarks"
  ON forum_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete own bookmarks"
  ON forum_bookmarks FOR DELETE
  USING (auth.uid() = user_id);
