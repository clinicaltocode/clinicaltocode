-- Add is_pinned column to forum_threads for pinning guidelines/announcements
ALTER TABLE forum_threads
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;

-- Index to sort pinned threads first efficiently
CREATE INDEX IF NOT EXISTS idx_threads_pinned_created
  ON forum_threads(category_id, is_pinned DESC, created_at DESC);

-- Pin existing guideline seed threads
UPDATE forum_threads
SET is_pinned = true
WHERE slug LIKE 'welcome-to-%-forum-guidelines-seed';
