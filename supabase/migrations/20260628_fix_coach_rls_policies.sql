-- Supabase Migration: Fix RLS Policies for Coach & Play Modes

-- 1. buyer_scenarios: allow public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'buyer_scenarios' AND policyname = 'buyer_scenarios_public_read'
  ) THEN
    CREATE POLICY buyer_scenarios_public_read ON buyer_scenarios
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- 2. coach_settings: allow public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coach_settings' AND policyname = 'coach_settings_public_read'
  ) THEN
    CREATE POLICY coach_settings_public_read ON coach_settings
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- 3. training_sessions: allow public insert access (for practice mode)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'training_sessions' AND policyname = 'training_sessions_public_insert'
  ) THEN
    CREATE POLICY training_sessions_public_insert ON training_sessions
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- 4. coach_analytics (if it exists): allow public insert
-- Since there's an API for analytics, we might just use service_role there, but just in case:
-- If the table doesn't exist, this won't crash if we wrap it safely or just rely on API using service role.

-- 5. Add metadata column to buyer_scenarios if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='buyer_scenarios' AND column_name='metadata'
  ) THEN
    ALTER TABLE buyer_scenarios ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;
