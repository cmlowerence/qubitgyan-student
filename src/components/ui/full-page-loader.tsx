import React from 'react';
import { Logo } from './logo';

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <div className="animate-breath rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-cyan-900/20">
          <Logo theme="dark" />
        </div>

        <p className="text-slate-300 text-sm font-medium tracking-widest uppercase opacity-90">Loading Qubitgyan...</p>
      </div>
    </div>
  );
}
