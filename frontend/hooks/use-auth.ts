'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, TokenResponse } from '@/types';
import { authApi } from '@/lib/api-client';
import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/lib/constants';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (session?.user) {
        // If using NextAuth session, use that
        setUser(session.user as User);
      } else {
        // Try to get user from API
        const response = await authApi.getMe();
        setUser(response.data);
      }
    } catch (err) {
      setError('Failed to fetch user data');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Login with credentials
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use NextAuth signIn
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        
        if (result?.error) {
          setError(result.error);
          return { success: false, error: result.error };
        }
        
        // Fetch user data
        await fetchUser();
        
        return { success: true };
      } catch (err: any) {
        setError(err.message || 'Login failed');
        return { success: false, error: err.message || 'Login failed' };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUser]
  );

  // Login with Google
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await signIn('google', { callbackUrl: '/dashboard' });
      
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      return { success: false, error: err.message || 'Google login failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(
    async (email: string, password: string, firstName?: string, lastName?: string) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // For registration, we'll use a custom endpoint
        // This is a placeholder - implement your registration logic
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, firstName, lastName }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Registration failed');
          return { success: false, error: data.error || 'Registration failed' };
        }
        
        // Auto login after registration
        await login(email, password);
        
        return { success: true };
      } catch (err: any) {
        setError(err.message || 'Registration failed');
        return { success: false, error: err.message || 'Registration failed' };
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      }
      
      // Use NextAuth signOut
      await signOut({ callbackUrl: '/login' });
      
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if authenticated
  const isAuthenticated = useCallback(() => {
    return !!user || status === 'authenticated';
  }, [user, status]);

  return {
    user,
    isLoading,
    error,
    status,
    login,
    loginWithGoogle,
    register,
    logout,
    isAuthenticated,
    fetchUser,
  };
}
