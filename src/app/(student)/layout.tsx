'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/student/sidebar';
import { Menu, Search, X, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { getProgressSummary, searchGlobal, SearchNode, getNotifications } from '@/lib/learning';
import { NotificationCenter, NotificationItem } from '@/components/student/notification-center';
import { useGamificationHeartbeat } from '@/hooks/use-gamification';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  useGamificationHeartbeat();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentCount, setRecentCount] = useState(0);
  const [apiNotifications, setApiNotifications] = useState<any[]>([]);

  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchNode[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    getProgressSummary().then((summary) => setRecentCount(summary.recent.length));
    getNotifications().then(setApiNotifications);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    const delayDebounceFn = setTimeout(async () => {
      const data = await searchGlobal(trimmed);
      setResults(data);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // 3. Format Notifications
  const notifications = React.useMemo<NotificationItem[]>(() => {
    return apiNotifications.map(n => ({
      id: String(n.id),
      title: n.title,
      description: n.message,
      createdAt: new Date(n.created_at).toLocaleDateString(undefined, { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }), 
      isUnread: !n.is_read
    }));
  }, [apiNotifications]);

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
          {/* Top Bar (Search & Notifications) */}
          <div className="hidden lg:flex items-center justify-between rounded-2xl bg-white/70 border border-white shadow-sm px-5 py-3 mb-6 gap-3 relative">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <div className="flex items-center gap-2 text-slate-500 bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 transition-all focus-within:ring-2 focus-within:ring-violet-500">
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-violet-600" /> : <Search className="w-4 h-4" />}
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search lessons, sections, topics..."
                  className="bg-transparent outline-none text-sm w-full font-medium"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {(results.length > 0 || (query.trim() && !isSearching)) && (
                <div className="absolute top-full mt-2 left-0 right-0 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-50 max-h-96 overflow-y-auto">
                  {results.length > 0 ? (
                    results.map((result) => (
                      <Link 
                        key={result.id} 
                        href={result.href} 
                        className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors" 
                        onClick={() => setQuery('')}
                      >
                        <p className="text-sm font-bold text-slate-900 truncate">{result.name}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{result.type}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No results found for "{query}".
                    </div>
                  )}
                </div>
              )}
            </div>

            <NotificationCenter items={notifications} />
          </div>

          <div className="lg:hidden flex justify-end mb-3">
            <NotificationCenter items={notifications} />
          </div>
          
          {children}
        </div>
      </main>
    </div>
  );
}