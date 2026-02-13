import { createClient } from "@supabase/supabase-js";

// Access via import.meta.env for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        "Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY).",
        "Auth and database features will not work until they are configured."
    );
}

export const supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key"
);
