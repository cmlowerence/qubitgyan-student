'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { studentNavItems } from '@/config/nav-config';
import { useAuth } from '@/context/auth-context';
import { useUi } from '@/components/providers/ui-provider';
import { LogOut, X } from 'lucide-react';

interface SidebarProps {
  className?: string;
  onClose?: () => void; // Used only on mobile to close menu when clicking a link
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { showConfirm } = useUi();

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: "Log out?",
      message: "Are you sure you want to sign out?",
      confirmText: "Log out",
      variant: "warning",
    });

    if (confirmed) {
      logout();
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-slate-900 text-white", className)}>
      {/* 1. Header Area */}
      <div className="p-6 flex items-center justify-between">
        <Logo className="scale-75 origin-left" /> {/* White logo on dark bg */}
        
        {/* Mobile Close Button (Only visible if onClose is provided) */}
        {onClose && (
          <button 
            onClick={onClose} 
            className="md:hidden p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      {/* 2. Navigation Links */}
      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Menu
        </p>
        
        {studentNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose} // Close sidebar on mobile when link is clicked
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
              {item.title}
            </Link>
          );
        })}
      </div>

      {/* 3. User Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3">
          {/* Avatar / Placeholder */}
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
            {user?.first_name?.charAt(0) || "S"}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.first_name || "Student"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email}
            </p>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
