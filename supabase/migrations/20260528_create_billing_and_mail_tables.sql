-- Migration: Create Billing, Seats, Mail Domains and Rename tables to Enrollments
-- Up

-- Rename assignments and assignment_links to enrollments and enrollment_links
ALTER TABLE IF EXISTS public.assignments RENAME TO enrollments;
ALTER TABLE IF EXISTS public.assignment_links RENAME TO enrollment_links;

-- Ensure constraints and foreign keys are aligned after rename
-- (PostgreSQL automatically renames references, but let's make sure things are fully in place)

-- Create Seats configuration table
CREATE TABLE IF NOT EXISTS public.listener_seats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL UNIQUE,
    max_seats INTEGER DEFAULT 100 NOT NULL,
    active_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Mail domain configuration
CREATE TABLE IF NOT EXISTS public.mail_domains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain_name TEXT NOT NULL UNIQUE,
    sender_email TEXT NOT NULL,
    is_confirmed BOOLEAN DEFAULT false NOT NULL,
    user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS and add policies
ALTER TABLE public.listener_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON public.listener_seats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.mail_domains FOR ALL USING (true) WITH CHECK (true);

-- Seed initial default quota
INSERT INTO public.listener_seats (user_id, max_seats) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 100)
ON CONFLICT (user_id) DO NOTHING;

-- Seed default mail domain for testing
INSERT INTO public.mail_domains (domain_name, sender_email, is_confirmed, user_id) VALUES
('acme.com', 'onboarding@acme.com', true, '00000000-0000-0000-0000-000000000000'::uuid)
ON CONFLICT (domain_name) DO NOTHING;
