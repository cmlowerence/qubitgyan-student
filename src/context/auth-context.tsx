'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { UserProfile } from '@/types';
import { FullPageLoader } from '@/components/ui/full-page-loader';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 1. Check Auth on App Start
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      // If no token, stop loading and let the page decide if it needs to redirect
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Validate token by fetching user
        const { data } = await api.get('/users/me/');
        setUser(data);
      } catch (error) {
        // If token is invalid, clear it
        console.error("Auth validation failed", error);
        localStorage.removeItem('access_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. Protect Routes (Security Guard)
useEffect(() => {
    const publicPaths = ['/login', '/forgot-password', '/suspended', '/admission', '/admission/success'];
    
    if (!isLoading) {
      if (user?.is_suspended && pathname !== '/suspended') {
        router.push('/suspended');
      } 
      else if (!user && !publicPaths.includes(pathname)) {
        router.push('/login');
      } 
      else if (user && !user.is_suspended && publicPaths.includes(pathname)) {
        if (pathname !== '/suspended') {
          router.push('/dashboard');
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  // 3. Login Action
  const login = async (token: string) => {
    localStorage.setItem('access_token', token);
    // Fetch user immediately to update state
    const { data } = await api.get('/users/me/');
    setUser(data);
    router.push('/dashboard');
  };

  // 4. Logout Action
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/login');
  };

  // Show the beautiful loader while we check credentials
  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
