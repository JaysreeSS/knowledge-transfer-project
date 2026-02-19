import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            console.log("[Auth] Checking session...");
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                console.log("[Auth] Session found, fetching profile...");
                await fetchProfile(session.user.id, session.user.email);
            } else {
                console.log("[Auth] No session found.");
            }
            setLoading(false);
        };

        getSession();

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log(`[Auth] Auth state change: ${_event}`);
            if (session) {
                await fetchProfile(session.user.id, session.user.email);
            } else {
                setUser(null);
                sessionStorage.removeItem("kt_user");
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId, email) => {
        console.log(`[Auth] Fetching profile for ${email} (${userId})`);

        // Helper to add timeout to promises
        const withTimeout = (promise, ms = 5000) => {
            return Promise.race([
                promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase request timed out")), ms))
            ]);
        };

        try {
            // 1. Try by ID (Preferred)
            console.log("[Auth] 1. Querying 'users' by ID...");
            let { data, error } = await withTimeout(
                supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle()
            );

            if (error) {
                console.error("[Auth] Error fetching profile by ID:", error);
            } else {
                console.log("[Auth] 1. Query by ID result:", data ? "Found" : "Not Found");
            }

            // 2. Fallback: Try by username (which is the email) if ID lookup fails
            if (!data && email) {
                console.log("[Auth] 2. Profile not found by UUID, trying by email/username lookup...", email);
                const { data: byUsername, error: usernameError } = await withTimeout(
                    supabase
                        .from('users')
                        .select('*')
                        .or(`username.eq."${email}",email.eq."${email}"`)
                        .maybeSingle()
                );

                if (usernameError) {
                    console.error("[Auth] Username lookup error:", usernameError);
                }

                if (byUsername) {
                    data = byUsername;
                    console.log("[Auth] 2. Found profile by lookup.");
                } else {
                    console.log("[Auth] 2. Profile NOT found by lookup either.");
                }
            }

            if (data) {
                console.log("[Auth] Profile found:", data.username);
                // Normalize old roles if present in legacy sessions
                let normalizedRole = data.role;
                if (data.role === 'admin') normalizedRole = 'System Admin';
                if (data.role === 'manager') normalizedRole = 'Manager';

                const userWithAdmin = {
                    ...data,
                    role: normalizedRole,
                    isAdmin: normalizedRole === 'System Admin'
                };
                setUser(userWithAdmin);
                sessionStorage.setItem("kt_user", JSON.stringify(userWithAdmin));
                return userWithAdmin;
            }

            console.warn("[Auth] No profile found in database.");
            return null;

        } catch (err) {
            console.error("[Auth] Exception during fetchProfile:", err);
            // If DB fails, we might still want to allow login if we have a session? 
            // For now, let's just return null and let the UI handle the error.
            return null;
        }
    };

    const login = async (username, password) => {
        console.log("[Auth] Login initiated for:", username);

        try {
            let emailToUse = username;

            // If the input doesn't look like an email, try to find the email associated with this username
            if (!username.includes('@')) {
                console.log("[Auth] Input appears to be a username. Looking up email...");
                const { data: userRecord, error: lookupError } = await supabase
                    .from('users')
                    .select('email')
                    .eq('username', username)
                    .maybeSingle();

                if (lookupError) {
                    console.error("[Auth] Username lookup error:", lookupError);
                }

                if (userRecord && userRecord.email) {
                    console.log("[Auth] Email found for username:", userRecord.email);
                    emailToUse = userRecord.email;
                } else {
                    console.warn("[Auth] No email found for username. Attempting login as-is.");
                }
            }

            // Simply sign in. The onAuthStateChange listener will handle profile fetching and state updates.
            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailToUse,
                password,
            });

            if (error) {
                console.error("[Auth] Login error:", error.message);
                return { success: false, error: error.message };
            }

            if (data.user) {
                console.log("[Auth] signInWithPassword success. Waiting for onAuthStateChange to set user...");
                // We return true here, but the UI should wait for 'user' state to populate via the useEffect hook
                return { success: true, user: data.user };
            }
            return { success: false, error: "Authentication failed (No user returned)." };
        } catch (err) {
            console.error("[Auth] Login Exception:", err);
            return { success: false, error: err.message || "An unexpected error occurred." };
        }
    };

    const logout = async () => {
        console.log("[Auth] Logging out...");
        await supabase.auth.signOut();
        setUser(null);
        sessionStorage.removeItem("kt_user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
