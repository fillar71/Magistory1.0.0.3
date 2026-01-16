import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ''),
      'process.env.PEXELS_API_KEY': JSON.stringify(env.PEXELS_API_KEY || process.env.PEXELS_API_KEY || ''),
      'process.env.PIXABAY_API_KEY': JSON.stringify(env.PIXABAY_API_KEY || process.env.PIXABAY_API_KEY || ''),
      // Supabase Vars
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      // Render Server URL
      'process.env.RENDER_URL': JSON.stringify(env.RENDER_URL || env.VITE_RENDER_URL || ''),
      
      'process.env': JSON.stringify({}) // Fallback
    },
    server: {
      host: true,
    }
  };
});