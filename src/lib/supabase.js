
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables. Please check your .env file.");
}

console.log("[Supabase] Initializing client...", supabaseUrl ? "URL present" : "URL MISSING");

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            storage: window.sessionStorage,
        }
    })
    : {
        from: () => ({
            select: () => Promise.resolve({ data: [], error: { message: "Supabase not configured" } }),
            insert: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
            update: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
            delete: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        }),
        storage: {
            from: () => ({
                upload: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
                getPublicUrl: () => ({ data: { publicUrl: "" } })
            })
        }
    };
