'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { studentNavItems } from '@/config/nav-config';
import { useAuth } from '@/context/auth-context';
import { useUi } from '@/components/providers/ui-provider';
import { LogOut, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProgressSummary } from '@/lib/learning';

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { showConfirm } = useUi();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getProgressSummary().then((summary) => setStreak(summary.streakDays));
  }, []);

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: 'Log out?',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Log out',
      variant: 'warning',
    });

    if (confirmed) logout();
  };

  return (
    <div className={cn('flex flex-col h-full bg-slate-950 text-white', className)}>
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
        <Logo theme="dark" className="scale-75 origin-left" />
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        <div className="rounded-2xl bg-gradient-to-r from-violet-600/20 via-cyan-500/20 to-emerald-500/20 border border-white/10 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Learning Streak</p>
          <p className="text-xl font-bold mt-1">{streak} Day{streak === 1 ? '' : 's'} 🔥</p>
          <p className="text-xs text-slate-300 mt-1">Keep your momentum and unlock badges.</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-2 overflow-y-auto">
        {studentNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 group',
                isActive
                  ? 'bg-white text-slate-900 shadow-lg shadow-slate-900/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900',
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-200')} />
              {item.title}
              {isActive && <Sparkles className="w-4 h-4 ml-auto text-violet-600" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900/80 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold shrink-0">
            {user?.first_name?.charAt(0) || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.first_name || 'Student'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'student@qubitgyan.com'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-rose-500/10 hover:text-rose-300 text-slate-400 rounded-xl transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
