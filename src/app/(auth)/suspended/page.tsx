'use client';

import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function SuspendedPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 p-8 text-center shadow-2xl shadow-rose-900/5">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-3">Account Suspended</h1>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Your access to QubitGyan has been temporarily suspended by an administrator. If you believe this is a mistake, please contact support.
        </p>

        <button 
          onClick={logout}
          className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </div>
  );
}