-- Migration: add_forum_tables
-- Creates forum_categories and forum_threads tables for CONT-04.
-- forum_threads is minimal in Phase 3; Phase 4 will add reply_count,
-- view_count, RLS policies, and the full forum surface.

-- ---------------------------------------------------------------------------
-- forum_categories
-- Maps Sanity category documents to Postgres rows so forum threads can
-- be assigned to a category. The sanity_category_id column links to the
-- Sanity category _id, enabling idempotent lookup in the webhook handler.
-- ---------------------------------------------------------------------------
CREATE TABLE forum_categories (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  sanity_category_id TEXT UNIQUE,   -- Sanity _id of the category document
  description        TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed categories — these must match the category documents created in
-- Sanity Studio. Create the Studio documents first, then update the
-- sanity_category_id values to match the actual Sanity _ids.
INSERT INTO forum_categories (title, slug, description) VALUES
  ('Nursing',                'nursing',              'Clinical perspectives from nursing professionals'),
  ('EHR',                    'ehr',                  'Electronic health record workflows and usability'),
  ('Clinical Informatics',   'clinical-informatics', 'Data, analytics, and clinical decision support'),
  ('Pharmacy',               'pharmacy',             'Medication management and pharmacy informatics'),
  ('Physician Perspectives', 'physician-perspectives', 'Articles written by or for physicians');

-- ---------------------------------------------------------------------------
-- forum_threads
-- Minimal schema for Phase 3. Auto-created when an article is published
-- via the Sanity webhook (CONT-04). Phase 4 adds reply/view counts and RLS.
-- ---------------------------------------------------------------------------
CREATE TABLE forum_threads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  body_preview      TEXT,                 -- First ~200 chars of article excerpt
  article_sanity_id TEXT UNIQUE,          -- Sanity _id (immutable, unlike slug)
  category_id       UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
  is_article_thread BOOLEAN NOT NULL DEFAULT TRUE,
  author_id         UUID,                 -- NULL in Phase 3; service insert
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Explicit partial unique index for idempotency guard in webhook handler
CREATE UNIQUE INDEX forum_threads_article_sanity_id_idx
  ON forum_threads (article_sanity_id)
  WHERE article_sanity_id IS NOT NULL;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER forum_threads_updated_at
  BEFORE UPDATE ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
