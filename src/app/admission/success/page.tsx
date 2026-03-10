'use client';

import Link from 'next/link';
import { GraduationCap, MailCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdmissionSuccessPage() {
  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 p-6 sm:p-10 md:p-12 text-center shadow-xl shadow-slate-900/5 animate-in zoom-in-95 duration-500">
        
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-70" />
          <div className="relative w-full h-full bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-[3px] sm:border-4 border-white shadow-sm">
            <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-3 sm:mb-4 tracking-tight leading-tight">
          Application Received!
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto">
          Thank you for applying to QubitGyan. Your admission request has been successfully submitted and is currently in our queue.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-left space-y-3 sm:space-y-4 mb-8 sm:mb-10">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" /> What happens next?
          </h3>
          <ul className="space-y-2.5 sm:space-y-3 text-slate-600 text-xs sm:text-sm font-medium">
            <li className="flex items-start gap-2.5 sm:gap-3">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-bold mt-0.5 sm:mt-0">1</span>
              <span className="leading-snug">An administrator will review your academic information and goals.</span>
            </li>
            <li className="flex items-start gap-2.5 sm:gap-3">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-bold mt-0.5 sm:mt-0">2</span>
              <span className="leading-snug">If approved, your student account will be automatically generated.</span>
            </li>
            <li className="flex items-start gap-2.5 sm:gap-3">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-bold mt-0.5 sm:mt-0">3</span>
              <span className="leading-snug">You will receive an email with your temporary password and a secure link to access the portal.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link 
            href="/login" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-violet-600 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98] sm:hover:-translate-y-0.5"
          >
            Go to Login Portal <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <a 
            href="mailto:support@qubitgyan.com" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-slate-50 transition-colors active:scale-[0.98]"
          >
            <MailCheck className="w-4 h-4 sm:w-5 sm:h-5" /> Contact Support
          </a>
        </div>
        
      </div>
    </div>
  );
}