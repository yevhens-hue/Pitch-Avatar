-- Migration: Add metadata JSONB column to projects table
-- Required for: createProject() Server Action (coach settings, custom config, etc.)

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Backfill existing rows with empty metadata
UPDATE public.projects
SET metadata = '{}'::jsonb
WHERE metadata IS NULL;
