-- Supabase Migration: Extend Coach & Train Mode Tables
-- Epic: AI Sales Coach & Train Mode

-- 1. Extend coach_settings with new fields
ALTER TABLE coach_settings
  ADD COLUMN IF NOT EXISTS evaluation_mode VARCHAR(20) DEFAULT 'auto'
    CHECK (evaluation_mode IN ('auto', 'llm', 'manual')),
  ADD COLUMN IF NOT EXISTS analytics_mode BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS role_template VARCHAR(30) DEFAULT 'buyer',
  ADD COLUMN IF NOT EXISTS system_prompt TEXT,
  ADD COLUMN IF NOT EXISTS check_answer BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 2. Extend training_sessions with evaluation result and duration
ALTER TABLE training_sessions
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS evaluation JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 3. Extend buyer_scenarios with role and question type
ALTER TABLE buyer_scenarios
  ADD COLUMN IF NOT EXISTS role_template VARCHAR(30) DEFAULT 'buyer',
  ADD COLUMN IF NOT EXISTS question_type VARCHAR(30) DEFAULT 'product'
    CHECK (question_type IN ('product', 'price', 'competitors', 'roi', 'objection', 'use_case', 'technical')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 4. Create additional indexes for new query patterns
CREATE INDEX IF NOT EXISTS idx_buyer_scenarios_role ON buyer_scenarios(role_template);
CREATE INDEX IF NOT EXISTS idx_buyer_scenarios_type ON buyer_scenarios(question_type);
CREATE INDEX IF NOT EXISTS idx_training_sessions_score ON training_sessions(score);
CREATE INDEX IF NOT EXISTS idx_training_sessions_created ON training_sessions(created_at);

-- 5. Enable RLS on coach tables (if not already enabled)
ALTER TABLE coach_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Presenter can only access their own project's coach data
DO $$
BEGIN
  -- coach_settings: owner access via projects table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coach_settings' AND policyname = 'coach_settings_owner_access'
  ) THEN
    CREATE POLICY coach_settings_owner_access ON coach_settings
      USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
  END IF;

  -- buyer_scenarios: owner access via projects table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'buyer_scenarios' AND policyname = 'buyer_scenarios_owner_access'
  ) THEN
    CREATE POLICY buyer_scenarios_owner_access ON buyer_scenarios
      USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
  END IF;

  -- training_sessions: owner access via projects table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'training_sessions' AND policyname = 'training_sessions_owner_access'
  ) THEN
    CREATE POLICY training_sessions_owner_access ON training_sessions
      USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
  END IF;
END $$;
