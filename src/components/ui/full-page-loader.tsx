// src/components/ui/full-page-loader.tsx
import React from 'react';
import { Logo } from './logo';

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md animate-fade-in p-4">
      <div className="flex flex-col items-center gap-5 sm:gap-6">
        <div className="animate-breath rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/70 p-3 sm:p-4 shadow-2xl shadow-cyan-900/20 backdrop-blur-sm">
          <Logo theme="dark" className="scale-90 sm:scale-100 transition-transform" />
        </div>
        <p className="text-slate-300 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase opacity-90">
          Loading Qubitgyan...
        </p>
      </div>
    </div>
  );
}