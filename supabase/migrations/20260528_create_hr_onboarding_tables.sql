-- Migration: Create HR Onboarding and Engagement Tables
-- Up

-- 1. Create stubs for Groups & Courses
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Core Listeners table
CREATE TABLE IF NOT EXISTS public.listeners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    industry TEXT,
    position TEXT,
    linkedin TEXT,
    country TEXT,
    department TEXT,
    language TEXT DEFAULT 'en' NOT NULL,
    documents TEXT[] DEFAULT '{}'::text[] NOT NULL,
    user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_listener_email_per_user UNIQUE (email, user_id)
);

-- 3. Listener Groups association (M:N)
CREATE TABLE IF NOT EXISTS public.listener_groups (
    listener_id UUID REFERENCES public.listeners(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    PRIMARY KEY (listener_id, group_id)
);

-- 4. Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    listener_id UUID REFERENCES public.listeners(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pending' NOT NULL, -- 'Pending', 'In Progress', 'Completed', 'Failed'
    start_date TIMESTAMPTZ,
    email_schedule JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Course Projects association (M:N)
CREATE TABLE IF NOT EXISTS public.course_projects (
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, project_id)
);

-- 6. Assignment Links
CREATE TABLE IF NOT EXISTS public.assignment_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    listener_id UUID REFERENCES public.listeners(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    unique_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Project/Course Type Administration
CREATE TABLE IF NOT EXISTS public.project_course_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Result Catalog
CREATE TABLE IF NOT EXISTS public.result_catalog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    data_type TEXT NOT NULL, -- 'string', 'bool', 'integer', 'double'
    parameter TEXT,
    aggregation TEXT DEFAULT 'Last value' NOT NULL, -- 'Last value', 'Sum', 'Max', 'Use LLM'
    llm_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Result Values
CREATE TABLE IF NOT EXISTS public.result_values (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_link_id UUID REFERENCES public.assignment_links(id) ON DELETE CASCADE,
    result_id UUID REFERENCES public.result_catalog(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listeners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listener_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_course_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_values ENABLE ROW LEVEL SECURITY;

-- Create Policies (allowing all operations during development / prototype stage)
CREATE POLICY "Allow all" ON public.groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.listeners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.listener_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.course_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.assignment_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.project_course_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.result_catalog FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.result_values FOR ALL USING (true) WITH CHECK (true);

-- Insert Initial/Mock Data for testing
INSERT INTO public.listeners (first_name, last_name, email, position, company, country, language) VALUES
('John', 'Smith', 'john.smith@acme.com', 'QA Engineer', 'Acme Corp', 'USA', 'en'),
('Maria', 'Kowalski', 'm.kowalski@polska.pl', 'Sales Manager', 'Polska Trade', 'Poland', 'pl'),
('Sven', 'Larsson', 'sven.larsson@ikea.se', 'Product Owner', 'IKEA', 'Sweden', 'sv'),
('Elena', 'Petrova', 'elena.petrova@yandex.ru', 'HR Specialist', 'Yandex', 'Russia', 'ru'),
('Yevhen', 'Shaforostov', 'yevhen@pitchavatar.com', 'Product Owner', 'Pitch Avatar', 'Germany', 'en')
ON CONFLICT DO NOTHING;

INSERT INTO public.project_course_types (name, description) VALUES
('Interview', 'Automated screening and recruitment interviews'),
('L&D Compliance', 'Learning and development mandatory corporate trainings'),
('Sales Qualification', 'Presentations targeting product qualification and lead capture')
ON CONFLICT DO NOTHING;

INSERT INTO public.result_catalog (name, data_type, parameter, aggregation, llm_prompt) VALUES
('watch_time_percentage', 'double', 'watch_time', 'Max', NULL),
('compliance_passed', 'bool', 'quiz_result', 'Last value', 'Determine if the listener has passed compliance quiz with >= 80% correct answers.'),
('wants_meeting', 'bool', 'chat_intent', 'Use LLM', 'Classify if the listener expressed intent to schedule a meeting or demo based on chat transcript.')
ON CONFLICT DO NOTHING;
