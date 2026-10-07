import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

// Only allow your trusted frontend origins here.
const ALLOWED_ORIGINS = [
    "http://localhost:5174",
    "https://projectkt-one.vercel.app",
]

function getCorsHeaders(origin: string | null) {
    const allowedOrigin =
        origin && ALLOWED_ORIGINS.includes(origin)
            ? origin
            : ALLOWED_ORIGINS[0]

    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Vary": "Origin",
    }
}

serve(async (req: Request) => {
    const origin = req.headers.get("origin")
    const corsHeaders = getCorsHeaders(origin)

    if (req.method === "OPTIONS") {
        // Reject unknown browser origins.
        if (origin && !ALLOWED_ORIGINS.includes(origin)) {
            return new Response("Forbidden", {
                status: 403,
                headers: corsHeaders,
            })
        }

        return new Response("ok", {
            headers: corsHeaders,
        })
    }

    try {
        // ------------------------------------------------------------
        // 1. Validate the Authorization header
        // ------------------------------------------------------------
        const authHeader = req.headers.get("Authorization")

        if (!authHeader?.startsWith("Bearer ")) {
            return new Response(
                JSON.stringify({ error: "Missing or invalid Authorization header" }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            )
        }

        const token = authHeader.replace("Bearer ", "").trim()

        if (!token) {
            return new Response(
                JSON.stringify({ error: "Missing access token" }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            )
        }

        // ------------------------------------------------------------
        // 2. Create the service-role client
        //
        // This client is ONLY used after the caller has been
        // authenticated and authorized.
        // ------------------------------------------------------------
        const adminClient = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // ------------------------------------------------------------
        // 3. Validate the JWT
        // ------------------------------------------------------------
        const {
            data: { user: authUser },
            error: authUserError,
        } = await adminClient.auth.getUser(token)

        if (authUserError || !authUser) {
            console.error(
                "[manage-user] Authentication failed:",
                authUserError?.message
            )

            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            )
        }

        // ------------------------------------------------------------
        // 4. Load the caller's profile
        // ------------------------------------------------------------
        const { data: callerProfile, error: profileLookupError } =
            await adminClient
                .from("users")
                .select("id, role")
                .eq("id", authUser.id)
                .single()

        if (profileLookupError || !callerProfile) {
            console.error(
                "[manage-user] Caller profile lookup failed:",
                profileLookupError?.message
            )

            return new Response(
                JSON.stringify({ error: "User profile not found" }),
                {
                    status: 403,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            )
        }

        // ------------------------------------------------------------
        // 5. Require System Admin role
        // ------------------------------------------------------------
        if (callerProfile.role !== "System Admin") {
            console.warn(
                `[manage-user] Unauthorized access attempt by ${authUser.id}`
            )

            return new Response(
                JSON.stringify({ error: "Forbidden: System Admin access required" }),
                {
                    status: 403,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            )
        }

        // ------------------------------------------------------------
        // Caller is now authenticated + authorized.
        // ------------------------------------------------------------

        const {
            action,
            email,
            username,
            password,
            name,
            role,
            userId,
        } = await req.json()

        // ============================================================
        // CREATE USER
        // ============================================================
        if (action === "create") {
            if (!username || !password || !name || !role) {
                return new Response(
                    JSON.stringify({
                        error: "username, password, name, and role are required",
                    }),
                    {
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    }
                )
            }

            // Use provided email for auth; fall back to username.
            const authEmail = email || username

            // 1. Create auth user.
            const { data: authData, error: authError } =
                await adminClient.auth.admin.createUser({
                    email: authEmail,
                    password,
                    email_confirm: true,
                })

            if (authError) {
                console.error(
                    "[manage-user] Auth createUser error:",
                    authError.message
                )

                return new Response(
                    JSON.stringify({ error: authError.message }),
                    {
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    }
                )
            }

            // 2. Update profile created by the DB trigger.
            const profileUpdate: Record<string, any> = {
                username,
                name,
                role,
            }

            if (email) {
                profileUpdate.email = email
            }

            const { data: profileData, error: profileError } =
                await adminClient
                    .from("users")
                    .update(profileUpdate)
                    .eq("id", authData.user.id)
                    .select()
                    .single()

            if (profileError) {
                console.error(
                    "[manage-user] Profile update error:",
                    profileError.message
                )

                // Roll back auth user if profile update fails.
                await adminClient.auth.admin.deleteUser(authData.user.id)

                return new Response(
                    JSON.stringify({
                        error: `Profile update failed: ${profileError.message}`,
                    }),
                    {
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    }
                )
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    user: profileData,
                }),
                {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            )
        }

        // ============================================================
        // DELETE USER
        // ============================================================
        if (action === "delete") {
            if (!userId) {
                return new Response(
                    JSON.stringify({ error: "userId is required" }),
                    {
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    }
                )
            }

            // Step 1: Remove user from project teams.
            const { error: memberError } = await adminClient
                .from("project_members")
                .delete()
                .eq("user_id", userId)

            if (memberError) {
                console.error(
                    `[manage-user] Warning: could not remove project_members for ${userId}:`,
                    memberError.message
                )
            }

            // Step 2: Unassign sections.
            const { error: sectionError } = await adminClient
                .from("project_sections")
                .update({ contributor_id: null })
                .eq("contributor_id", userId)

            if (sectionError) {
                console.error(
                    `[manage-user] Warning: could not nullify contributor_id for ${userId}:`,
                    sectionError.message
                )
            }

            // Step 3: Delete profile.
            const { error: profileError } = await adminClient
                .from("users")
                .delete()
                .eq("id", userId)

            if (profileError) {
                return new Response(
                    JSON.stringify({
                        error: `Failed to delete user profile: ${profileError.message}`,
                    }),
                    {
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    }
                )
            }

            // Step 4: Delete Supabase Auth account.
            const { error: authError } =
                await adminClient.auth.admin.deleteUser(userId)

            if (authError) {
                return new Response(
                    JSON.stringify({
                        error: `Profile deleted but auth removal failed: ${authError.message}`,
                    }),
                    {
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    }
                )
            }

            return new Response(
                JSON.stringify({ success: true }),
                {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            )
        }

        return new Response(
            JSON.stringify({
                error: 'Invalid action. Use "create" or "delete".',
            }),
            {
                status: 400,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            }
        )
    } catch (error: any) {
        console.error("[manage-user] Unexpected error:", error)

        return new Response(
            JSON.stringify({
                error: "Internal server error",
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            }
        )
    }
})