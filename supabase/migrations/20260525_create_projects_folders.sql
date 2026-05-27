-- Migration: Create projects and folders tables
-- Up

-- Safely drop existing tables and policies to ensure schema clean slate
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.folders CASCADE;

CREATE TABLE public.folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    user_id UUID NOT NULL, -- references auth.users(id) if auth is used, or just text if mocked
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    thumbnail_url TEXT,
    slides_count INTEGER DEFAULT 0,
    duration TEXT,
    views INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    links_count INTEGER DEFAULT 0,
    assistant_status TEXT DEFAULT 'none',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations during development / prototype stage)
CREATE POLICY "Allow all" ON public.folders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.projects FOR ALL USING (true) WITH CHECK (true);

-- Insert Mock Data (Optional, for testing)
INSERT INTO public.folders (id, name, user_id) VALUES
('b3017a41-fa6e-44db-9cb7-7bc9b6a9df36', 'ava', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (title, type, status, folder_id, user_id, slides_count, views, leads, links_count, assistant_status) VALUES
('Q1 Marketing Campaign', 'slides', 'ready', 'b3017a41-fa6e-44db-9cb7-7bc9b6a9df36', '00000000-0000-0000-0000-000000000000', 12, 104, 5, 2, 'active'),
('Sales Enablement', 'slides', 'published', 'b3017a41-fa6e-44db-9cb7-7bc9b6a9df36', '00000000-0000-0000-0000-000000000000', 8, 420, 12, 5, 'none'),
('Internal Training', 'video', 'draft', NULL, '00000000-0000-0000-0000-000000000000', 0, 0, 0, 0, 'none'),
('Customer Support Bot', 'chat-avatar', 'ready', NULL, '00000000-0000-0000-0000-000000000000', 0, 1024, 34, 1, 'active')
ON CONFLICT DO NOTHING;
