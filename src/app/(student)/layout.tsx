'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/student/sidebar';
import { Bell, Menu, Search, X } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { getProgressSummary, getSearchNodes, SearchNode } from '@/lib/learning';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchNodes, setSearchNodes] = useState<SearchNode[]>([]);
  const [openNotif, setOpenNotif] = useState(false);
  const [recentCount, setRecentCount] = useState(0);

  useEffect(() => {
    getSearchNodes().then(setSearchNodes);
    getProgressSummary().then((summary) => setRecentCount(summary.recent.length));
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return searchNodes.filter((node) => node.name.toLowerCase().includes(normalized)).slice(0, 7);
  }, [query, searchNodes]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_45%),linear-gradient(to_bottom,#f8fafc,#eef2ff)]">
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 z-40 p-4">
        <Sidebar className="rounded-3xl border border-slate-800/70 shadow-2xl shadow-slate-900/30" />
      </aside>

      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <Logo theme="light" className="scale-75 origin-left" />
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
          <div className="hidden lg:flex items-center justify-between rounded-2xl bg-white/70 border border-white shadow-sm px-5 py-3 mb-6 gap-3 relative">
            <div className="relative flex-1 max-w-xl">
              <div className="flex items-center gap-2 text-slate-500 bg-slate-100 rounded-xl px-3 py-2 border border-slate-200">
                <Search className="w-4 h-4" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search lessons, sections, topics..."
                  className="bg-transparent outline-none text-sm w-full"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {results.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-20">
                  {results.map((result) => (
                    <Link key={result.id} href={result.href} className="block px-3 py-2 rounded-lg hover:bg-slate-100" onClick={() => setQuery('')}>
                      <p className="text-sm font-semibold text-slate-800 truncate">{result.name}</p>
                      <p className="text-xs text-slate-500">{result.type}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setOpenNotif((value) => !value)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 relative">
                <Bell className="w-5 h-5" />
                {recentCount > 0 && <span className="absolute -top-1 -right-1 rounded-full bg-rose-500 text-white text-[10px] w-4 h-4 grid place-items-center">{recentCount}</span>}
              </button>
              {openNotif && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-lg p-3">
                  <p className="text-sm font-bold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {recentCount > 0 ? `You completed ${recentCount} resources recently. Keep going!` : 'No fresh notifications yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
