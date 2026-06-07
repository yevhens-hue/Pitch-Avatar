-- Migration: Create Presenters Table
-- Up

CREATE TABLE IF NOT EXISTS public.presenters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.presenters ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow all on presenters" ON public.presenters FOR ALL USING (true) WITH CHECK (true);

-- Seed initial MVP data
INSERT INTO public.presenters (email, first_name, last_name) VALUES
('yevhen.shaforostov@roi4cio.com', 'Yevhen', 'Shaforostov'),
('john.doe@roi4cio.com', 'John', 'Doe'),
('jane.smith@roi4cio.com', 'Jane', 'Smith')
ON CONFLICT (email) DO NOTHING;
