'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, Lock, Mail, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/ui/logo';
import { useUi } from '@/components/providers/ui-provider';

export default function LoginPage() {
  const { login } = useAuth();
  const { showAlert } = useUi();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      showAlert({
        title: 'Missing credentials',
        message: 'Please enter your registered email and password to continue.',
        variant: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        status === 401
          ? 'Invalid email or password.'
          : status === 403
            ? 'Your account is currently suspended.'
            : 'We could not sign you in. Please try again.';

      showAlert({
        title: 'Sign in failed',
        message,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-indigo-100/50">
      <div className="hidden lg:flex flex-col justify-between bg-[radial-gradient(circle_at_top,#6366f1,#1d4ed8_45%,#0f172a)] p-10 text-white">
        <div>
          <Logo theme="dark" />
          <h1 className="mt-10 text-4xl font-black leading-tight">A complete student portal rebuilt for focused learning.</h1>
          <p className="mt-4 text-indigo-100">Track progress, access resources, take assessments, and stay updated from one responsive dashboard.</p>
        </div>
        <p className="text-sm text-indigo-100/80">Secure access with your registered email address.</p>
      </div>

      <div className="p-6 sm:p-10">
        <div className="mb-8 lg:hidden">
          <Logo theme="light" className="scale-90 origin-left" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Sign in</h2>
        <p className="mt-2 text-slate-500">Use your email address as your username.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="student@example.com"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-indigo-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Signing in...</>
            ) : (
              <>Continue <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <Link href="/admission" className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Need an account? Submit admission request <UserPlus className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
