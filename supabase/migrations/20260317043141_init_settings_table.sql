-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    portal_name TEXT DEFAULT 'Knowledge Transfer',
    org_name TEXT DEFAULT 'Ideassion Technology Solutions',
    support_email TEXT DEFAULT '',
    default_project_period INTEGER DEFAULT 30,
    categories JSONB DEFAULT '["Development", "Design", "DevOps", "QA", "Management"]'::JSONB,
    enable_announcements BOOLEAN DEFAULT FALSE,
    enable_email_alerts BOOLEAN DEFAULT TRUE,
    theme_color TEXT DEFAULT '#7c3aed',
    sidebar_style TEXT DEFAULT 'glass',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT one_row CHECK (id = 1)
);

-- Insert default row if not exists
INSERT INTO public.system_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read on settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin update on settings" ON public.system_settings FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'System Admin'
    )
);
