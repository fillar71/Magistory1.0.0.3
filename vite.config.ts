import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for libraries that expect it
      'process.env': JSON.stringify(env),
      // Map specific env vars to ensure they are available
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || ''),
      'process.env.PEXELS_API_KEY': JSON.stringify(env.PEXELS_API_KEY || env.VITE_PEXELS_API_KEY || ''),
      'process.env.PIXABAY_API_KEY': JSON.stringify(env.PIXABAY_API_KEY || env.VITE_PIXABAY_API_KEY || ''),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || ''),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'process.env.RENDER_URL': JSON.stringify(env.RENDER_URL || env.VITE_RENDER_URL || ''),
      // Fix "global is not defined" error for some older libs
      'global': 'window',
    },
    server: {
      host: true,
    },
    build: {
      // Prevent backend files from being included in frontend bundle
      rollupOptions: {
        external: ['fluent-ffmpeg', 'express', '@prisma/client'],
      }
    }
  };
});