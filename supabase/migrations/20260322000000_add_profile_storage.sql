-- Phase 5 User Profiles: Storage bucket for avatars, username backfill, trigger update
--
-- This migration must be applied via Supabase SQL Editor.
-- See STATE.md Wave 7 manual steps.

-- ---------------------------------------------------------------------------
-- Section 1: Create avatars bucket
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Section 2: Storage RLS policies
-- ---------------------------------------------------------------------------

CREATE POLICY "avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ---------------------------------------------------------------------------
-- Section 3: Username backfill for existing NULL rows
-- ---------------------------------------------------------------------------

UPDATE public.user_profiles
SET username = LOWER(REGEXP_REPLACE(
  SPLIT_PART(au.email, '@', 1) || '_' || SUBSTRING(gen_random_uuid()::text, 1, 6),
  '[^a-z0-9_]', '_', 'g'
))
FROM auth.users au
WHERE user_profiles.id = au.id
  AND user_profiles.username IS NULL;

-- ---------------------------------------------------------------------------
-- Section 4: Update handle_new_user() trigger to set username at signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username)
  VALUES (
    NEW.id,
    LOWER(REGEXP_REPLACE(
      SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(gen_random_uuid()::text, 1, 6),
      '[^a-z0-9_]', '_', 'g'
    ))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
