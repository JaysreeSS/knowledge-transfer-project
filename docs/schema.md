## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `username` | `text` |  Nullable Unique |
| `name` | `text` |  Nullable |
| `role` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `first_login` | `bool` |  Nullable |
| `avatar_url` | `text` |  Nullable |

## Table `templates`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `order` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `projects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `completion` | `int4` |  Nullable |
| `deadline` | `timestamptz` |  Nullable |
| `manager_id` | `uuid` |  Nullable |
| `manager_name` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `lifecycle_mode` | `text` |  |
| `transition_count` | `int4` |  |
| `transition_type` | `text` |  Nullable |
| `archived_at` | `timestamptz` |  Nullable |
| `tech_stack` | `jsonb` |  Nullable |
| `ai_insights` | `jsonb` |  Nullable |
| `readiness_score` | `int4` |  Nullable |

## Table `project_members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `project_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `kt_role` | `text` |  |

## Table `project_sections`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `project_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `content` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `contributor_id` | `uuid` |  Nullable |
| `order` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  |
| `last_updated_at` | `timestamptz` |  Nullable |
| `clarity_score` | `int4` |  Nullable |
| `clarity_suggestions` | `jsonb` |  Nullable |
| `ai_quiz` | `jsonb` |  Nullable |

## Table `section_attachments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `section_id` | `uuid` |  Nullable |
| `file_name` | `text` |  |
| `file_size` | `text` |  Nullable |
| `url` | `text` |  |
| `uploaded_by_name` | `text` |  Nullable |
| `uploaded_at` | `timestamptz` |  |

## Table `section_comments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `section_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `user_name` | `text` |  Nullable |
| `text` | `text` |  |
| `timestamp` | `timestamptz` |  |

## Table `section_links`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `section_id` | `uuid` |  |
| `title` | `text` |  |
| `url` | `text` |  |
| `created_at` | `timestamptz` |  |
| `created_by_name` | `text` |  |

## Table `receiver_section_progress`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `project_id` | `uuid` |  |
| `section_id` | `uuid` |  |
| `receiver_id` | `uuid` |  |
| `status` | `text` |  |
| `updated_at` | `timestamptz` |  |

## Table `system_settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary |
| `portal_name` | `text` |  Nullable |
| `org_name` | `text` |  Nullable |
| `support_email` | `text` |  Nullable |
| `default_project_period` | `int4` |  Nullable |
| `enable_announcements` | `bool` |  Nullable |
| `theme_color` | `text` |  Nullable |
| `sidebar_style` | `text` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `require_review` | `bool` |  Nullable |
| `allow_contributor_sections` | `bool` |  Nullable |
| `auto_freeze` | `bool` |  Nullable |
| `border_radius` | `text` |  Nullable |
| `sidebar_position` | `text` |  Nullable |

## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `module` | `text` |  |
| `type` | `text` |  |
| `title` | `text` |  |
| `body` | `text` |  Nullable |
| `project_id` | `uuid` |  Nullable |
| `project_name` | `text` |  Nullable |
| `is_read` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `project_transitions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `project_id` | `uuid` |  Nullable |
| `transition_type` | `text` |  |
| `scope` | `text` |  |
| `selected_sections` | `jsonb` |  Nullable |
| `initiator_id` | `uuid` |  Nullable |
| `receiver_ids` | `jsonb` |  Nullable |
| `status` | `text` |  Nullable |
| `started_at` | `timestamptz` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |

## RLS Policies

### `system_settings`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow admin update on settings` | UPDATE | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'System Admin'::text))))` | — |
| `Allow public read on settings` | SELECT | public | PERMISSIVE | `true` | — |

### `receiver_section_progress`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow authenticated users to delete progress` | DELETE | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `Allow authenticated users to insert progress` | INSERT | public | PERMISSIVE | — | `(auth.role() = 'authenticated'::text)` |
| `Allow authenticated users to read progress` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `Allow authenticated users to update progress` | UPDATE | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `Allow managers to update progress` | UPDATE | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM projects   WHERE ((projects.id = receiver_section_progress.project_id) AND (projects.manager_id = auth.uid()))))` | — |
| `Allow members to read progress` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM project_members   WHERE ((project_members.project_id = receiver_section_progress.project_id) AND (project_members.user_id = auth.uid()))))` | — |
| `Allow receivers to insert their own progress` | INSERT | public | PERMISSIVE | — | `(receiver_id = auth.uid())` |
| `Allow receivers to update their own progress` | UPDATE | public | PERMISSIVE | `(receiver_id = auth.uid())` | — |

### `section_links`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow all authenticated users to read links` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `Allow authenticated users to insert links` | INSERT | public | PERMISSIVE | — | `(auth.role() = 'authenticated'::text)` |
| `Allow users to delete links` | DELETE | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |

### `notifications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated users can insert notifications` | INSERT | public | PERMISSIVE | — | `(auth.role() = 'authenticated'::text)` |
| `Users can delete own notifications` | DELETE | public | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Users can read own notifications` | SELECT | public | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Users can update own notifications` | UPDATE | public | PERMISSIVE | `(user_id = auth.uid())` | — |

### `users`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable all access for authenticated users` | ALL | authenticated | PERMISSIVE | `true` | `true` |
| `Public profiles are viewable by everyone` | SELECT | public | PERMISSIVE | `true` | — |
| `Users can update own profile` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = id)` | — |

### `project_members`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated users can view/manage members` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `projects`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated users can view/manage projects` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `templates`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated users can manage templates` | ALL | authenticated | PERMISSIVE | `true` | `true` |
| `Templates are viewable by everyone` | SELECT | public | PERMISSIVE | `true` | — |

### `project_sections`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated users can view/manage sections` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `section_attachments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated users can view/manage attachments` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `section_comments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated users can view/manage comments` | ALL | authenticated | PERMISSIVE | `true` | `true` |

