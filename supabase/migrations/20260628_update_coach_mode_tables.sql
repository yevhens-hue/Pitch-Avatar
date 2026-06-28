-- Supabase Migration: Update Coach Mode Tables for MVP features

-- 1. Extend projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS is_coach_mode BOOLEAN DEFAULT false;

-- 2. Extend coach_settings table
ALTER TABLE coach_settings
  ADD COLUMN IF NOT EXISTS question_delivery VARCHAR(20) DEFAULT 'random' CHECK (question_delivery IN ('random', 'sequential')),
  ADD COLUMN IF NOT EXISTS start_from_slide_id VARCHAR(100);

-- 3. Extend buyer_scenarios table
ALTER TABLE buyer_scenarios
  ADD COLUMN IF NOT EXISTS role_id UUID,
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
