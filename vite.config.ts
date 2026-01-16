import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Manually define specific keys to ensure they are replaced statically by Vite
      // This is safer and more reliable than stringifying the whole `env` object
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID || ''),
      'process.env.PEXELS_API_KEY': JSON.stringify(env.PEXELS_API_KEY || ''),
      'process.env.PIXABAY_API_KEY': JSON.stringify(env.PIXABAY_API_KEY || ''),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'process.env.RENDER_URL': JSON.stringify(env.RENDER_URL || ''),
      
      // Polyfill strict process.env object to avoid "process is not defined" in some 3rd party libs
      'process.env': {},
      
      // Polyfill global for some older libraries
      'global': 'window',
    },
    server: {
      host: true,
    },
    build: {
      rollupOptions: {
        // Ensure backend-only libraries are explicitly excluded from frontend bundle
        external: ['fluent-ffmpeg', 'express', '@prisma/client', 'fs', 'path', 'os'],
      }
    }
  };
});