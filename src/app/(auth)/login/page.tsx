'use client';

import React, { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/context/auth-context';
import { useUi } from '@/components/providers/ui-provider';
import api from '@/lib/api';
import { Loader2, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { showAlert } = useUi();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NEW: Handle the Sign Up Click ---
  const handleSignUpClick = () => {
    showAlert({
      title: "Enrollment Required",
      message: "Access to Qubitgyan is currently by invitation only. Please contact the administration office to request your enrollment credentials. We look forward to having you! Happy Learning.",
      variant: "info",
      confirmText: "Got it"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!email || !password) {
    showAlert({ 
      title: "Missing Information", 
      message: "Please enter both your email and password.", 
      variant: "warning" 
    });
    return;
  }

  setIsSubmitting(true);

  try {
    const baseUrl = api.defaults.baseURL || '';
    const loginUrl = baseUrl.replace('/v1', '/token/'); 
    const response = await api.post(loginUrl, { 
      username: email,
      password 
    });

    await login(response.data.access);
  } catch (error: any) {
    console.error(error);
    const status = error.response?.status;
    let msg = "Something went wrong. Please try again.";
    
    if (status === 404) msg = "Login URL not found. Please contact support.";
    else if (status === 401) msg = "Invalid email or password.";
    else if (status === 400) msg = "Invalid credentials format.";
    else if (status === 403) msg = "Your account may be suspended.";
    else if (status === 500) msg = "Server error. Please try again later.";

    showAlert({ 
      title: "Login Failed", 
      message: msg, 
      variant: "error" 
    });
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-8 animate-in-scale">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <Logo className="scale-90 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
        <p className="text-slate-500 text-sm">Sign in to continue your learning journey</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="student@qubitgyan.com"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex justify-between ml-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Password
            </label>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Footer - NOW INTERACTIVE */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <button 
          onClick={handleSignUpClick}
          className="group flex items-center justify-center gap-2 w-full text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          <span>Don't have an account?</span>
          <span className="font-semibold underline underline-offset-2 decoration-transparent group-hover:decoration-blue-600 transition-all flex items-center gap-1">
            Enroll Here <UserPlus className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
