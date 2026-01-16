import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';

// Safe access to Environment Variables in Vite
// We use 'any' cast to avoid TypeScript errors if types aren't generated
const getEnv = (key: string) => {
  // Try import.meta.env (Vite standard)
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv[key]) return metaEnv[key];
  
  // Try global process.env (polyfilled by vite config)
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  
  return '';
};

// Fallback logic
const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID') || getEnv('VITE_GOOGLE_CLIENT_ID') || "dummy-client-id-for-fallback";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if (GOOGLE_CLIENT_ID === "dummy-client-id-for-fallback") {
    console.warn("GOOGLE_CLIENT_ID is missing. Google Login will not work properly.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
            <App />
        </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);