'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/context/auth-context';
import { useUi } from '@/components/providers/ui-provider';
import api from '@/lib/api';
import { Loader2, User, Lock, ArrowRight, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { showAlert } = useUi();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showAlert({ title: 'Missing Information', message: 'Please enter both your username and password.', variant: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = api.defaults.baseURL || '';
      const loginUrl = baseUrl.replace('/v1', '/token/');
      const response = await api.post(loginUrl, { username, password });
      await login(response.data.access);
    } catch (error: any) {
      const status = error.response?.status;
      let msg = 'Something went wrong. Please try again.';
      if (status === 404) msg = 'Login endpoint not found. Contact Admin.';
      else if (status === 401) msg = 'Invalid username or password.';
      else if (status === 403) msg = 'Your account is suspended.';
      showAlert({ title: 'Login Failed', message: msg, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-8 animate-in-scale">
      <div className="flex flex-col items-center mb-8">
        <Logo theme="light" className="scale-90 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
        <p className="text-slate-500 text-sm">Sign in to continue your learning journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Username</label>
          <div className="relative group">
            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4"
              placeholder="Enter your username"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {isSubmitting ? 'Verifying...' : <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <Link href="/admission" className="group flex items-center justify-center gap-2 w-full text-sm text-slate-500 hover:text-blue-600 transition-colors">
          <span>Don't have an account?</span>
          <span className="font-semibold underline underline-offset-2 decoration-transparent group-hover:decoration-blue-600 transition-all flex items-center gap-1">
            Enroll Here <UserPlus className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
