import { createClient } from '@supabase/supabase-js';

// Helper to get env vars safely in both Vite and Polyfilled environments
const getEnv = (key: string) => {
    // Check Vite native env first
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
        return meta.env[key];
    }
    // Check process.env (fallback)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    return '';
};

// Try to retrieve URL and Key from possible sources
const rawUrl = getEnv('VITE_SUPABASE_URL');
const rawKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Debug logging (removed in production, useful for now)
console.log("Supabase Config Check:", { 
    hasUrl: !!rawUrl, 
    hasKey: !!rawKey, 
    urlPreview: rawUrl ? rawUrl.substring(0, 10) + '...' : 'MISSING' 
});

if (!rawUrl || !rawKey) {
    console.warn("⚠️ Supabase URL or Key is missing. Check your .env file.");
}

// Check if we have valid configuration
export const isSupabaseConfigured = !!rawUrl && !!rawKey && rawUrl !== 'https://placeholder.supabase.co';

// CRITICAL FIX: Ensure valid URL structure to prevent crash
export const supabaseUrl = rawUrl || 'https://placeholder.supabase.co';
export const supabaseAnonKey = rawKey || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);