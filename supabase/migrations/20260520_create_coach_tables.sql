-- Supabase Migration: Buyer AI Avatar - Coach & Train Mode Tables

-- 1. Create coach_settings Table
CREATE TABLE IF NOT EXISTS coach_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  show_answer_format VARCHAR(20) DEFAULT 'text' CHECK (show_answer_format IN ('text', 'voice', 'none')),
  evaluate_immediately BOOLEAN DEFAULT true,
  allow_skip BOOLEAN DEFAULT false,
  max_questions INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create buyer_scenarios Table
CREATE TABLE IF NOT EXISTS buyer_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  expected_slide_id VARCHAR(100), -- Reference to slide index or ID
  is_generated BOOLEAN DEFAULT false,
  custom_actions JSONB DEFAULT '[]', -- Clickable metadata actions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create training_sessions Table
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  listener_id UUID REFERENCES listeners(id) ON DELETE SET NULL, -- References listener/candidate
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  is_train_mode BOOLEAN DEFAULT false,
  session_logs JSONB DEFAULT '[]', -- Conversation log details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_coach_settings_project ON coach_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_buyer_scenarios_project ON buyer_scenarios(project_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_project ON training_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_listener ON training_sessions(listener_id);
