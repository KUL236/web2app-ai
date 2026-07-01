-- ============================================================
-- Web2App AI — Complete Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================
-- TABLE: profiles
-- Auto-created on signup via trigger
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  builds_count  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: apps
-- ============================================================
CREATE TABLE IF NOT EXISTS public.apps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  app_name      TEXT NOT NULL CHECK (length(app_name) BETWEEN 2 AND 50),
  website_url   TEXT NOT NULL CHECK (website_url ~ '^https?://'),
  package_name  TEXT NOT NULL UNIQUE CHECK (package_name ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'),
  icon_color    TEXT NOT NULL DEFAULT '#6366f1' CHECK (icon_color ~ '^#[0-9A-Fa-f]{6}$'),
  icon_source   TEXT NOT NULL DEFAULT 'favicon' CHECK (icon_source IN ('favicon', 'upload')),
  icon_url      TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: builds
-- ============================================================
CREATE TABLE IF NOT EXISTS public.builds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id          UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'queued'
                    CHECK (status IN ('queued', 'building', 'signing', 'complete', 'failed')),
  github_run_id   TEXT,
  download_url    TEXT,
  apk_size        BIGINT,
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: downloads
-- ============================================================
CREATE TABLE IF NOT EXISTS public.downloads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id        UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address      TEXT,
  downloaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 100),
  message     TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 500),
  type        TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON public.apps(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_package_name ON public.apps(package_name);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON public.apps(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_builds_user_id ON public.builds(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_app_id ON public.builds(app_id);
CREATE INDEX IF NOT EXISTS idx_builds_status ON public.builds(status);
CREATE INDEX IF NOT EXISTS idx_builds_created_at ON public.builds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_builds_github_run_id ON public.builds(github_run_id);

CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_build_id ON public.downloads(build_id);
CREATE INDEX IF NOT EXISTS idx_downloads_downloaded_at ON public.downloads(downloaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_apps_updated_at
  BEFORE UPDATE ON public.apps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: Increment builds count
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_builds_count(user_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET builds_count = builds_count + 1
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ── profiles ────────────────────────────────────────────────
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (TRUE);  -- handled by trigger with SECURITY DEFINER

-- ── apps ────────────────────────────────────────────────────
CREATE POLICY "Users can view own apps"
  ON public.apps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own apps"
  ON public.apps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own apps"
  ON public.apps FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own apps"
  ON public.apps FOR DELETE
  USING (auth.uid() = user_id);

-- ── builds ──────────────────────────────────────────────────
CREATE POLICY "Users can view own builds"
  ON public.builds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own builds"
  ON public.builds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own builds"
  ON public.builds FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role (used by Netlify functions) can do everything
CREATE POLICY "Service role full access to builds"
  ON public.builds FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── downloads ───────────────────────────────────────────────
CREATE POLICY "Users can view own downloads"
  ON public.downloads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own downloads"
  ON public.downloads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to downloads"
  ON public.downloads FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── notifications ────────────────────────────────────────────
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================
-- GRANT permissions to authenticated users
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.apps TO authenticated;
GRANT ALL ON public.builds TO authenticated;
GRANT ALL ON public.downloads TO authenticated;
GRANT ALL ON public.notifications TO authenticated;

-- Service role
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.apps TO service_role;
GRANT ALL ON public.builds TO service_role;
GRANT ALL ON public.downloads TO service_role;
GRANT ALL ON public.notifications TO service_role;

-- ============================================================
-- REALTIME (optional — enable for live build status updates)
-- ============================================================
-- Run in Supabase Dashboard > Database > Replication:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.builds;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================
-- VERIFICATION QUERIES (run to verify setup)
-- ============================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
