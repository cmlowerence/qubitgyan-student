'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/student/sidebar';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 z-40 border-r border-slate-200 shadow-xl">
        <Sidebar />
      </aside>


      {/* --- MOBILE HEADER (Hidden on Desktop) --- */}
      <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <Logo className="scale-75 origin-left" />
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>


      {/* --- MOBILE SIDEBAR DRAWER --- */}
      {/* Overlay Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sliding Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 w-[280px] bg-slate-900 z-50 shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>


      {/* --- MAIN CONTENT AREA --- */}
      {/* pl-0 on mobile (full width)
         md:pl-64 on desktop (pushes content to right of sidebar)
      */}
      <main className="pl-0 md:pl-64 min-h-screen transition-all duration-200 ease-in-out">
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
      
    </div>
  );
}
