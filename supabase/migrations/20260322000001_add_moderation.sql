-- Phase 6: Moderation
-- Creates: content_reports table with unique constraint, RLS policies,
--          admin UPDATE policies on forum_posts and forum_threads

-- ============================================================
-- content_reports table
-- ============================================================
CREATE TABLE content_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('thread', 'post')),
  target_id   UUID NOT NULL,
  reason      TEXT NOT NULL CHECK (reason IN (
                 'Patient data / PHI risk',
                 'Misinformation',
                 'Harassment',
                 'Spam',
                 'Off-topic for platform'
               )),
  details     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, target_type, target_id)
);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Authenticated users can submit their own reports
CREATE POLICY "authenticated users can submit reports"
  ON content_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Reporters can see their own reports (grayed-out button check)
CREATE POLICY "users can see own reports"
  ON content_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Admins can read all reports
CREATE POLICY "admins can read all reports"
  ON content_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update reports (mark reviewed)
CREATE POLICY "admins can update reports"
  ON content_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================
-- Admin update policies on forum_posts and forum_threads
-- (allows soft-delete by admin, bypassing author_id RLS check)
-- ============================================================

CREATE POLICY "admins can update any post"
  ON forum_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "admins can update any thread"
  ON forum_threads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admin update policy on user_profiles (allows ban/unban)
CREATE POLICY "admins can update any user profile"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles AS admin_check
      WHERE admin_check.id = auth.uid() AND admin_check.is_admin = true
    )
  );
