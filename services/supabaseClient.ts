import { createClient } from '@supabase/supabase-js';

// Helper to get env vars safely in both Vite and Polyfilled environments
const getEnv = (key: string) => {
    // Check Vite native env
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) return metaEnv[key];
    
    // Check polyfilled process.env
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    
    return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Key is missing. Check your Vercel Environment Variables.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');