'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/student/sidebar';
import { Bell, Menu, Search } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_45%),linear-gradient(to_bottom,#f8fafc,#eef2ff)]">
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 z-40 p-4">
        <Sidebar className="rounded-3xl border border-slate-800/70 shadow-2xl shadow-slate-900/30" />
      </aside>

      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <Logo className="scale-75 origin-left" />
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <div
        className={cn(
          'fixed inset-0 bg-slate-950/60 z-40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 w-[300px] bg-slate-900 z-50 p-3 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} className="rounded-2xl" />
      </div>

      <main className="lg:pl-72 min-h-screen">
        <div className="px-4 py-5 lg:p-8 max-w-[1600px] mx-auto">
          <div className="hidden lg:flex items-center justify-between rounded-2xl bg-white/70 border border-white shadow-sm px-5 py-3 mb-6">
            <div className="flex items-center gap-2 text-slate-500 bg-slate-100 rounded-xl px-3 py-2 min-w-[280px]">
              <Search className="w-4 h-4" />
              <span className="text-sm">Focus mode activated for distraction-free learning</span>
            </div>
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
              <Bell className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
