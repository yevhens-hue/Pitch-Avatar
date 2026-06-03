-- Migration: Enrollments Improvements (Add missing fields)
-- Up

-- 1. Add missing fields to enrollments table
ALTER TABLE public.enrollments 
  ADD COLUMN IF NOT EXISTS target_type TEXT,
  ADD COLUMN IF NOT EXISTS content_type TEXT,
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;

-- 2. Add missing fields to enrollment_links table (if they are needed there too, but mainly in enrollments)
ALTER TABLE public.enrollment_links 
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;

-- Down (Optional, for reference)
-- ALTER TABLE public.enrollments DROP COLUMN target_type, DROP COLUMN content_type, DROP COLUMN group_id;
-- ALTER TABLE public.enrollment_links DROP COLUMN group_id;
