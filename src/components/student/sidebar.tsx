'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, X, Flame, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { studentNavItems } from '@/config/nav-config';
import { useAuth } from '@/context/auth-context';
import { useUi } from '@/components/providers/ui-provider';
import { getMyProfile } from '@/lib/learning';

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { showConfirm } = useUi();
  const [streak, setStreak] = useState(0);
  const [isLoadingStreak, setIsLoadingStreak] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const profile = await getMyProfile();
        if (profile) setStreak(profile.current_streak);
      } catch (error) {
        console.error('Failed to fetch streak');
      } finally {
        setIsLoadingStreak(false);
      }
    };
    fetchStreak();
  }, []);

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: 'Log out?',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Log out',
      variant: 'info',
    });

    if (confirmed) logout();
  };

  return (
    <aside className={cn('flex flex-col h-full bg-[#0B1120] border-r border-slate-800/60 text-slate-300 font-sans', className)}>
      
      {/* Header / Logo */}
      <div className="h-20 px-6 flex items-center justify-between shrink-0">
        <Logo theme="dark" className="scale-90 origin-left" />
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Gamification Widget */}
      <div className="px-5 py-2 shrink-0">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-slate-700/50 p-4 group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-500/20 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-colors pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
              <Flame className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">Current Streak</p>
              <p className="text-lg font-black text-white leading-none">
                {isLoadingStreak ? '...' : `${streak} Day${streak === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {studentNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group relative flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <Icon 
                className={cn(
                  'w-5 h-5 transition-transform duration-300', 
                  isActive ? 'text-indigo-100' : 'text-slate-500 group-hover:text-indigo-400',
                  !isActive && 'group-hover:scale-110'
                )} 
              />
              <span className="text-sm z-10">{item.title}</span>
              
              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded-[1.25rem] p-3 flex items-center gap-3 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden ring-2 ring-slate-800/50">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.first_name || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              <span className="bg-gradient-to-tr from-indigo-500 to-cyan-400 w-full h-full flex items-center justify-center">
                {user?.first_name?.charAt(0).toUpperCase() || 'S'}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.first_name || 'Student'}</p>
            <p className="text-[11px] font-medium text-slate-500 truncate">{user?.email || 'student@qubitgyan.com'}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
            title="Log out"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

    </aside>
  );
}