'use client';

import Link from 'next/link';
import { GraduationCap, MailCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdmissionSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 p-8 md:p-12 text-center shadow-xl shadow-slate-900/5">
        
        {/* Animated Icon Header */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-70" />
          <div className="relative w-full h-full bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <GraduationCap className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Application Received!
        </h1>
        
        <p className="text-slate-600 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
          Thank you for applying to QubitGyan. Your admission request has been successfully submitted and is currently in our queue.
        </p>

        {/* Instructions Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-4 mb-10">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-600" /> What happens next?
          </h3>
          <ul className="space-y-3 text-slate-600 text-sm font-medium">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 text-xs font-bold">1</span>
              An administrator will review your academic information and goals.
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 text-xs font-bold">2</span>
              If approved, your student account will be automatically generated.
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 text-xs font-bold">3</span>
              You will receive an email with your temporary password and a secure link to access the portal.
            </li>
          </ul>
        </div>

        {/* Action Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/login" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-violet-600 transition-all shadow-lg shadow-slate-900/10 hover:-translate-y-0.5"
          >
            Go to Login Portal <ArrowRight className="w-4 h-4" />
          </Link>
          <a 
            href="mailto:support@qubitgyan.com" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors"
          >
            <MailCheck className="w-4 h-4" /> Contact Support
          </a>
        </div>
        
      </div>
    </div>
  );
}