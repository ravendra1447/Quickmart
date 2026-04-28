'use client';
import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function AuthProvider({ children }) {
  const initialize = useAuthStore((s) => s.initialize);
  useEffect(() => { initialize(); }, [initialize]);
  
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
