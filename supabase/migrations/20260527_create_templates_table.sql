-- Migration: Create templates table
-- Up

DROP TABLE IF EXISTS public.templates CASCADE;

CREATE TABLE public.templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    product_types TEXT[],
    project_type TEXT NOT NULL,
    tags TEXT[],
    slide_count INTEGER DEFAULT 0,
    access_type TEXT NOT NULL,
    template_type TEXT NOT NULL,
    badge TEXT,
    thumbnail_url TEXT,
    selected_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    is_on_homepage BOOLEAN DEFAULT false,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations during development / prototype stage)
CREATE POLICY "Allow all" ON public.templates FOR ALL USING (true) WITH CHECK (true);

-- Insert Mock Data
INSERT INTO public.templates (name, description, product_types, project_type, tags, slide_count, access_type, template_type, badge, is_on_homepage, "order") VALUES
('Onboarding', 'Get new hires up to speed fast. Covers mission, tools, and first-week checklist.', '{"HR"}', 'Presentation + AI Avatar', '{"HR", "Training"}', 10, 'system', 'generate', 'Popular', true, 1),
('Corporate Newsletter', 'Monthly company updates, CEO highlights, product news, team spotlight, and upcoming events.', '{"Internal Communications"}', 'AI Avatar Only', '{"Communications", "Internal"}', 8, 'system', 'copy', NULL, true, 2),
('Product Presentation', 'Full product pitch: problem, solution, how it works, integrations, social proof, pricing, and CTA.', '{"Marketing"}', 'Presentation + AI Avatar', '{"Marketing", "Sales"}', 10, 'system', 'generate', NULL, true, 3),
('Sales Presentation & Deal Qualification', 'Full sales cycle deck: discovery, solution fit, ROI model, objection handling, and proposed next steps.', '{"Sales"}', 'AI Avatar Only', '{"Sales", "B2B"}', 9, 'system', 'copy', 'Hot', false, 4),
('AI HR Assistant', 'AI HR bot introduction: problem, capabilities, how it works, integrations, ROI, and live demo.', '{"HR"}', 'Presentation + AI Avatar', '{"HR", "AI"}', 8, 'system', 'generate', NULL, false, 5)
ON CONFLICT DO NOTHING;
