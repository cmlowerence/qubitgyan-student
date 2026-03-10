'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail, ShieldAlert, CheckCircle2, Clock, LifeBuoy } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/public/password-reset-request/', { email: email.trim() });
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMsg('Something went wrong connecting to the server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="m-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-indigo-100/50 p-8 sm:p-10">
      <div className="mb-8 flex justify-center">
        <Logo theme="light" />
      </div>

      {!isSuccess ? (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-100">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Forgot Password?</h2>
            <p className="mt-2 text-slate-500 text-sm font-medium">
              No worries, we&apos;ll send you a secure link to reset it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="student@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              {errorMsg && <p className="text-rose-500 text-xs font-bold mt-2 pl-1">{errorMsg}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 py-3.5 font-bold text-white hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/25 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Requesting Link...</>
              ) : (
                'Send Recovery Link'
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-2">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 relative">
            <CheckCircle2 className="w-10 h-10 relative z-10" />
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Request Received</h2>
          
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-amber-800 text-sm font-medium leading-relaxed flex items-start gap-2">
              <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              Please note: The password recovery email is processed through our secure queue and might take a little while to arrive in your inbox.
            </p>
          </div>

          <div className="text-sm font-medium text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="flex items-center justify-center gap-2 mb-2 text-slate-800 font-bold">
              <LifeBuoy className="w-4 h-4 text-indigo-500" /> Need immediate help?
            </p>
            <p>Contact the administrator directly at:</p>
            <a href="mailto:cm.chrisrobert@gmail.com" className="text-indigo-600 font-bold hover:underline block mt-1">
              cm.chrisrobert@gmail.com
            </a>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-100">
        <Link 
          href="/login" 
          className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to log in
        </Link>
      </div>
    </div>
  );
}