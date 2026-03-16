-- Phase 2 Auth: create user_profiles table with RLS and new-user trigger
--
-- user_profiles is the public-facing profile record, keyed to auth.users.
-- Phase 2 only creates the table and trigger.
-- Username, bio, avatar, and credential badge are populated in Phase 5.

CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  credential_badge TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false NOT NULL,
  is_banned BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS — required before any policy takes effect
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Public read: profiles are visible to all visitors
CREATE POLICY "profiles are publicly readable" ON public.user_profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger function: auto-insert a profile row when a new user signs up.
-- SECURITY DEFINER runs as the function owner (postgres), which has
-- INSERT privileges on public.user_profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Fire after every new row in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
