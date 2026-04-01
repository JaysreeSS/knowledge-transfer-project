import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const withTimeout = (promise, ms = 8000) => {
            return Promise.race([
                promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error("Auth request timed out")), ms))
            ]);
        };

        const getSession = async () => {
            console.log("[Auth] Checking session...");
            // Use session storage for immediate UI restore
            const cachedUser = sessionStorage.getItem("kt_user");
            if (cachedUser) {
                try {
                    setUser(JSON.parse(cachedUser));
                    setLoading(false);
                } catch (e) {
                    sessionStorage.removeItem("kt_user");
                }
            }

            try {
                const { data: { session } } = await withTimeout(supabase.auth.getSession());
                if (session) {
                    console.log("[Auth] Session found, fetching profile...");
                    const profile = await fetchProfile(session.user.id, session.user.email);
                    if (!profile && !cachedUser) {
                        // Profile fetch failed/timed out and no cache, force logout to be safe
                        console.warn("[Auth] Profile fetch failed/timed out, clearing session.");
                        await supabase.auth.signOut();
                        setUser(null);
                        sessionStorage.removeItem("kt_user");
                    }
                } else {
                    console.log("[Auth] No session found.");
                    setUser(null);
                    sessionStorage.removeItem("kt_user");
                }
            } catch (error) {
                console.error("[Auth] Session check timed out or failed:", error);
                if (!cachedUser) {
                    setUser(null);
                    sessionStorage.removeItem("kt_user");
                }
            } finally {
                setLoading(false);
            }
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
        console.log(`[Auth] Fetching profile for ${email}(${userId})`);

        // Helper to add timeout to promises
        const withTimeout = (promise, ms = 20000) => {
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
                console.log("[Auth] 2. Profile not found by UUID, trying by username lookup...", email);
                const { data: byUsername, error: usernameError } = await withTimeout(
                    supabase
                        .from('users')
                        .select('*')
                        .eq('username', email)
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
                // Merge local avatar preference if database column is missing
                const localAvatar = localStorage.getItem(`user_avatar_${userId}`);
                if (localAvatar && !data.avatar_url) {
                    data.avatar_url = localAvatar;
                }

                console.log("[Auth] Profile found, setting user state...");
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
            return null;
        }
    };

    const login = async (username, password) => {
        console.log("[Auth] Login initiated for:", username);

        try {
            let emailToUse = username;

            if (!username.includes('@')) {
                console.log("[Auth] Input appears to be a username. Attempting direct login.");
                // Note: If the email column is deleted, we expect users to log in with their email-formatted username.
                // If the system still supports non-email usernames, a mapping table or different auth strategy would be needed.
            }

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
                return { success: true, user: data.user };
            }
            return { success: false, error: "Authentication failed (No user returned)." };
        } catch (err) {
            console.error("[Auth] Login Exception:", err);
            return { success: false, error: err.message || "An unexpected error occurred." };
        }
    };

    const updateProfile = async (updates) => {
        try {
            console.log("[Auth] Updating profile...", updates);
            if (!user) throw new Error("No user logged in");

            const { name, password, avatar_url } = updates;
            let results = { success: true };

            if (password) {
                const { error: authError } = await supabase.auth.updateUser({ password });
                if (authError) throw authError;
                console.log("[Auth] Password updated successfully");
            }

            const dbUpdates = {};
            if (name !== undefined) dbUpdates.name = name;
            if (avatar_url !== undefined) dbUpdates.avatar_url = avatar_url;

            if (Object.keys(dbUpdates).length > 0) {
                const { error: dbError } = await supabase
                    .from('users')
                    .update(dbUpdates)
                    .eq('id', user.id);

                if (dbError) throw dbError;
                console.log("[Auth] Profile update handled successfully");

                await fetchProfile(user.id, user.username); // Re-fetch from DB
            }

            return results;
        } catch (error) {
            console.error("[Auth] Update profile failed:", error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        console.log("[Auth] Logging out...");
        await supabase.auth.signOut();
        setUser(null);
        sessionStorage.removeItem("kt_user");
    };

    const completeOnboarding = async () => {
        if (!user) {
            console.warn("[Auth] Cannot complete onboarding: No user in state.");
            return;
        }
        
        try {
            console.log("[Auth] Attempting to update first_login to false for:", user.id);
            const { data, error, count } = await supabase
                .from('users')
                .update({ first_login: false })
                .eq('id', user.id)
                .select();

            if (error) {
                console.error("[Auth] Supabase error during update:", error);
                // If it's just a column missing or timeout, we still want to update local state
                if (error.code === 'PGRST204' || error.message?.includes('first_login') || error.message?.includes('timeout')) {
                    console.warn("[Auth] Updating local state only due to Supabase issue.");
                } else {
                    // For other errors, we still continue to update local state to avoid user loop,
                    // but we log it as a failure for the DB part.
                    console.error("[Auth] Non-critical Supabase failure, continuing with local update.");
                }
            } else {
                console.log("[Auth] Supabase update successful. Rows affected:", count);
            }

            // ALWAYS update local state to prevent the tour from looping for the user
            const updatedUser = { ...user, first_login: false };
            setUser(updatedUser);
            sessionStorage.setItem("kt_user", JSON.stringify(updatedUser));
            console.log("[Auth] Local user state updated (first_login: false)");
            return { success: true };
        } catch (error) {
            console.error("[Auth] Failed to complete onboarding (DB part):", error);
            // Even in the catch block, we attempt to save the local state
            try {
                const updatedUser = { ...user, first_login: false };
                setUser(updatedUser);
                sessionStorage.setItem("kt_user", JSON.stringify(updatedUser));
            } catch (innerError) {
                console.error("[Auth] Critical failure updating local state:", innerError);
            }
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            updateProfile, 
            completeOnboarding,
            isAuthenticated: !!user, 
            loading 
        }}>
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
