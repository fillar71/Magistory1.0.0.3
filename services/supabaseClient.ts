import { createClient } from '@supabase/supabase-js';

// Helper to get env vars safely in both Vite and Polyfilled environments
const getEnv = (key: string) => {
    // Check Vite native env first
    // We use 'any' cast to avoid TypeScript errors if types aren't generated (Property 'env' does not exist on type 'ImportMeta')
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
        return meta.env[key];
    }
    return '';
};

// Try to retrieve URL and Key from possible sources
// We access process.env properties directly to allow Vite's string replacement to work if configured
const rawUrl = getEnv('VITE_SUPABASE_URL') || (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_URL : '');
const rawKey = getEnv('VITE_SUPABASE_ANON_KEY') || (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_ANON_KEY : '');

if (!rawUrl || !rawKey) {
    console.warn("⚠️ Supabase URL or Key is missing. Check your .env file or Vercel Environment Variables. App will run in limited mode.");
}

// CRITICAL FIX: "supabaseUrl is required" error.
// We must provide a valid-looking URL string to createClient even if env vars are missing.
// This prevents the entire app from crashing on load. Calls to Supabase will simply fail gracefully later.
const supabaseUrl = rawUrl || 'https://placeholder.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);