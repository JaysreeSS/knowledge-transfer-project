import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { action, email, username, password, name, role, userId } = await req.json()

        // Use service role client (bypasses RLS, has admin auth access)
        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // ── CREATE USER ─────────────────────────────────────────────────────────
        if (action === 'create') {
            // username = app login identifier (required)
            // email    = notification/reminder email (optional; falls back to username for auth)
            // Supabase Auth always needs an email, so we use the provided email or username as fallback
            if (!username || !password || !name || !role) {
                return new Response(
                    JSON.stringify({ error: 'username, password, name, and role are required' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                )
            }

            // Use provided email for auth; fall back to username if no email given
            const authEmail = email || username

            // 1. Create auth user (email_confirm: true = no verification email, can log in immediately)
            const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
                email: authEmail,
                password,
                email_confirm: true,
            })

            if (authError) {
                console.error('[manage-user] Auth createUser error:', authError.message)
                return new Response(
                    JSON.stringify({ error: authError.message }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                )
            }

            // 2. Update the profile row the DB trigger auto-created on auth insert.
            //    Trigger already inserted (id, email) — we fill in the rest.
            const profileUpdate: Record<string, any> = {
                username: username,
                name: name,
                role: role,
            }
            if (email) profileUpdate.email = email  // Override default email if provided

            const { data: profileData, error: profileError } = await adminClient
                .from('users')
                .update(profileUpdate)
                .eq('id', authData.user.id)
                .select()
                .single()

            if (profileError) {
                // Update failed — roll back auth user to avoid orphaned accounts
                console.error('[manage-user] Profile update error:', profileError.message)
                await adminClient.auth.admin.deleteUser(authData.user.id)
                return new Response(
                    JSON.stringify({ error: `Profile update failed: ${profileError.message}` }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                )
            }

            return new Response(
                JSON.stringify({ success: true, user: profileData }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // ── DELETE USER ─────────────────────────────────────────────────────────
        if (action === 'delete') {
            if (!userId) {
                return new Response(
                    JSON.stringify({ error: 'userId is required' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                )
            }

            // ── Step 1: Remove user from all project teams ───────────────────────
            // Works for all projects regardless of status (active or signed off)
            const { error: memberError } = await adminClient
                .from('project_members')
                .delete()
                .eq('user_id', userId)

            if (memberError) {
                // Non-fatal: log and continue — don't block deletion over this
                console.error(`[manage-user] Warning: could not remove project_members for ${userId}:`, memberError.message)
            }

            // ── Step 2: Unassign sections where this user was the contributor ────
            // Sets contributor_id to null — sections remain intact, just unassigned
            const { error: sectionError } = await adminClient
                .from('project_sections')
                .update({ contributor_id: null })
                .eq('contributor_id', userId)

            if (sectionError) {
                // Non-fatal: log and continue
                console.error(`[manage-user] Warning: could not nullify contributor_id for ${userId}:`, sectionError.message)
            }

            // ── Step 3: Delete the user profile from public.users ───────────────
            const { error: profileError } = await adminClient
                .from('users')
                .delete()
                .eq('id', userId)

            if (profileError) {
                return new Response(
                    JSON.stringify({ error: `Failed to delete user profile: ${profileError.message}` }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                )
            }

            // ── Step 4: Delete the Supabase Auth account ─────────────────────────
            // Revokes all sessions and removes credentials permanently
            const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

            if (authError) {
                return new Response(
                    JSON.stringify({ error: `Profile deleted but auth removal failed: ${authError.message}` }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                )
            }

            return new Response(
                JSON.stringify({ success: true }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        return new Response(
            JSON.stringify({ error: 'Invalid action. Use "create" or "delete".' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
