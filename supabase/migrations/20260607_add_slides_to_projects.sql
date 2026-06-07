-- Migration: Add slides to projects
-- Up

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS slides JSONB DEFAULT '[]'::jsonb;

-- Example: Update existing projects with empty slides to avoid nulls
UPDATE public.projects 
SET slides = '[]'::jsonb 
WHERE slides IS NULL;
