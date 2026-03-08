'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import api from '@/lib/api';
import { useUi } from '@/components/providers/ui-provider';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAlert } = useUi();

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!uid || !token) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Invalid Link</h2>
        <p className="text-slate-500 font-medium mb-6">
          This password reset link is invalid or missing required security tokens.
        </p>
        <Link href="/forgot-password" className="text-indigo-600 font-bold hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 8) {
      showAlert({ title: 'Password too short', message: 'Your new password must be at least 8 characters long.', variant: 'warning' });
      return;
    }

    if (password !== confirmPassword) {
      showAlert({ title: 'Passwords mismatch', message: 'The passwords you entered do not match.', variant: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/public/password-reset-confirm/', {
        uid,
        token,
        new_password: password
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to reset password. The link might be expired.';
      showAlert({ title: 'Reset Failed', message: errorMessage, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Password Reset!</h2>
        <p className="text-slate-500 font-medium mb-6">
          Your password has been updated securely. Redirecting you to the login page...
        </p>
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900">Create New Password</h2>
        <p className="mt-2 text-slate-500 text-sm font-medium">
          Enter a strong password below to secure your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">New Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
              placeholder="Min. 8 characters"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Confirm New Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
              placeholder="Type password again"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-slate-900 py-3.5 font-bold text-white hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/25 active:scale-[0.98] mt-2"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
          ) : (
            <>Save New Password <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-indigo-100/50 p-8 sm:p-10">
      <div className="mb-8 flex justify-center">
        <Logo theme="light" />
      </div>
      
      {/* Suspense is required when using useSearchParams in a client component in Next.js App Router */}
      <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}