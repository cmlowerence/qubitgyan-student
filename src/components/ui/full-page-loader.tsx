import React from 'react';
import { Logo } from './logo';

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        {/* The breathing logo */}
        <div className="animate-breath">
          <Logo />
        </div>
        
        {/* Optional Subtext */}
        <p className="text-slate-500 text-sm font-medium tracking-widest uppercase opacity-70">
          Loading Qubitgyan...
        </p>
      </div>
    </div>
  );
}
