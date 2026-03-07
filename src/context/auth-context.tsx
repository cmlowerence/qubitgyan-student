'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import api, { authApi } from '@/lib/api';
import { UserProfile } from '@/types';
import { FullPageLoader } from '@/components/ui/full-page-loader';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/login', '/forgot-password', '/suspended', '/admission', '/admission/success'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/users/me/');
        setUser(data);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (user?.is_suspended && pathname !== '/suspended') {
      router.push('/suspended');
      return;
    }

    const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

    if (!user && !isPublic) {
      router.push('/login');
      return;
    }

    if (user && !user.is_suspended && (pathname === '/login' || pathname === '/admission')) {
      router.push('/dashboard');
    }
  }, [isLoading, pathname, router, user]);

  const login = async (email: string, password: string) => {
    const { data: tokenData } = await authApi.loginWithEmail(email, password);

    localStorage.setItem('access_token', tokenData.access);
    if (tokenData.refresh) {
      localStorage.setItem('refresh_token', tokenData.refresh);
    }

    const { data } = await api.get('/users/me/');
    setUser(data);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.push('/login');
  };

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
