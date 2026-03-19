-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- The user this notification belongs to
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    -- module: 'admin' | 'manager' | 'icr'
    module TEXT NOT NULL DEFAULT 'admin',
    -- type: 'create' | 'signoff' | 'clarify' | 'review' | 'general'
    type TEXT NOT NULL DEFAULT 'general',
    title TEXT NOT NULL,
    body TEXT,
    -- Optionally link to a project
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    project_name TEXT,
    -- Whether this user has dismissed/read this notification
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can ONLY read their own notifications
CREATE POLICY "Users can read own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Users can mark their own notifications as read (UPDATE)
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid());

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (user_id = auth.uid());

-- Policy: Any authenticated user can INSERT notifications (system/trigger inserts)
-- In production you'd use a service_role or a DB trigger here
CREATE POLICY "Authenticated users can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
