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
import { useAuth } from '@/context/auth-context';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  useGamificationHeartbeat();

  const { user } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentCount, setRecentCount] = useState(0);
  const [apiNotifications, setApiNotifications] = useState<any[]>([]);

  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchNode[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      getProgressSummary().then((summary) => setRecentCount(summary.recent.length));
      getNotifications().then(setApiNotifications);
    }
  }, [user]);

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
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#dbeafe,transparent_45%),linear-gradient(to_bottom,#f8fafc,#eef2ff)] flex flex-col lg:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-screen w-72 z-40 p-4 lg:p-5 shrink-0">
        <Sidebar className="rounded-3xl border border-slate-800/70 shadow-2xl shadow-slate-900/30 h-full" />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 h-16 sm:h-20 flex items-center justify-between shrink-0">
        <Logo theme="light" className="scale-75 sm:scale-90 origin-left" />
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationCenter items={notifications} />
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg sm:rounded-xl text-slate-600 transition-colors active:scale-95">
            <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-slate-950/60 z-40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-[280px] sm:w-[320px] bg-slate-900 z-50 p-3 sm:p-4 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden h-[100dvh]',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} className="rounded-2xl sm:rounded-3xl h-full" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 relative z-0">
        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8 max-w-[1600px] w-full mx-auto flex flex-col flex-1">
          
          {/* Top Bar (Search & Notifications) - Desktop Only */}
          <div className="hidden lg:flex items-center justify-between rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-sm px-5 py-3 mb-6 gap-4 relative z-20 shrink-0">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <div className="flex items-center gap-2.5 text-slate-500 bg-slate-100 rounded-xl px-4 py-2.5 border border-slate-200 transition-all focus-within:ring-2 focus-within:ring-violet-500 focus-within:bg-white focus-within:shadow-sm">
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-violet-600" /> : <Search className="w-4 h-4" />}
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search lessons, sections, topics..."
                  className="bg-transparent outline-none text-sm w-full font-medium text-slate-800 placeholder:text-slate-400"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {(results.length > 0 || (query.trim() && !isSearching)) && (
                <div className="absolute top-full mt-2 left-0 right-0 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-50 max-h-[60vh] overflow-y-auto custom-scrollbar animate-in-scale origin-top">
                  {results.length > 0 ? (
                    results.map((result) => (
                      <Link 
                        key={result.id} 
                        href={result.href} 
                        className="block px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors" 
                        onClick={() => setQuery('')}
                      >
                        <p className="text-sm font-bold text-slate-900 truncate">{result.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{result.type}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-500 font-medium">
                      No results found for &quot;{query}&quot;.
                    </div>
                  )}
                </div>
              )}
            </div>

            <NotificationCenter items={notifications} />
          </div>
          
          {/* Page Content */}
          <div className="flex-1 flex flex-col">
            {children}
          </div>

        </div>
      </main>
    </div>
  );
}