import { createClient } from '@supabase/supabase-js';

// Vercel Environment Variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Key is missing. Check your environment variables.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');