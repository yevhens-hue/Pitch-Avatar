-- Create UI Skins table
CREATE TABLE ui_skins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT, -- e.g., 'hr.pitchavatar.com', 'hr.localhost:3000'
    is_default BOOLEAN DEFAULT false,
    menu_items JSONB DEFAULT '{}'::jsonb,
    list_columns JSONB DEFAULT '{}'::jsonb,
    home_page_config JSONB DEFAULT '{}'::jsonb,
    project_editor_items JSONB DEFAULT '{}'::jsonb,
    actions_config JSONB DEFAULT '{}'::jsonb,
    share_enroll_config JSONB DEFAULT '{}'::jsonb,
    apply_to JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE ui_skins ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read UI skins
CREATE POLICY "Users can view UI skins"
    ON ui_skins
    FOR SELECT
    TO authenticated
    USING (true);

-- For now, let's allow all authenticated to insert/update so we can prototype easily via Admin.
-- In production, this should be restricted to SuperAdmins.
CREATE POLICY "Users can manage UI skins"
    ON ui_skins
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert a default HR skin for testing
INSERT INTO ui_skins (name, domain, menu_items, home_page_config)
VALUES (
    'HR Onboarding Demo',
    'hr.localhost:3000',
    '{"hidden": ["Лидогенерация", "Marketing", "Integrations", "Analytics"]}',
    '{"slogan": "Welcome to Pitch Avatar for HR", "hideWizards": true}'
);
