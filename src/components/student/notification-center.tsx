'use client';

import { Bell, CheckCheck, CircleCheck, Dot } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useUi } from '@/components/providers/ui-provider';
import { markNotificationRead } from '@/lib/learning';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isUnread?: boolean; // Now accepts the flag from the backend
}

interface NotificationCenterProps {
  items: NotificationItem[];
}

export function NotificationCenter({ items }: NotificationCenterProps) {
  const { showAlert, showConfirm } = useUi();
  const [isOpen, setIsOpen] = useState(false);
  
  // We use this to instantly update the UI before the backend finishes (Optimistic UI)
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());

  // Count is now based on the backend flag AND our local instant-clicks
  const unreadCount = useMemo(() => {
    return items.filter((item) => item.isUnread && !localReadIds.has(item.id)).length;
  }, [items, localReadIds]);

  const markRead = async (id: string) => {
    // 1. Instantly update UI
    setLocalReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    // 2. Tell Django quietly in the background
    try {
      await markNotificationRead(Number(id));
    } catch (error) {
      console.error("Failed to sync read status with server", error);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) {
      await showAlert({
        title: 'All caught up',
        message: 'You have already read every notification.',
        variant: 'info',
      });
      return;
    }

    const confirmed = await showConfirm({
      title: 'Mark all as read?',
      message: `This will clear ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`,
      confirmText: 'Mark all read',
      cancelText: 'Keep unread',
      variant: 'info',
    });

    if (!confirmed) return;

    // Find exactly which ones need to be marked
    const unreadItems = items.filter((item) => item.isUnread && !localReadIds.has(item.id));

    // 1. Instantly update UI
    setLocalReadIds((prev) => {
      const next = new Set(prev);
      unreadItems.forEach((item) => next.add(item.id));
      return next;
    });

    // 2. Fire API calls in parallel
    try {
      await Promise.all(unreadItems.map((item) => markNotificationRead(Number(item.id))));
      await showAlert({
        title: 'Updated',
        message: 'All notifications are now marked as read.',
        variant: 'success',
      });
    } catch (error) {
      console.error("Failed to mark all as read on server", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 relative transition-colors"
        aria-label="Toggle notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 rounded-full bg-rose-500 text-white text-[10px] w-4 h-4 grid place-items-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[min(92vw,22rem)] rounded-2xl border border-slate-200 bg-white shadow-xl p-3 z-50 animate-in-scale origin-top-right">
          <div className="flex items-center justify-between gap-3 px-1 mb-1">
            <div>
              <p className="text-sm font-bold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-500">{unreadCount > 0 ? `${unreadCount} unread` : 'Everything is read'}</p>
            </div>
            <button onClick={markAllRead} className="text-xs font-semibold text-violet-700 hover:text-violet-900 inline-flex items-center gap-1 transition-colors bg-violet-50 px-2 py-1.5 rounded-lg hover:bg-violet-100">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>

          <div className="mt-3 max-h-[60vh] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {items.length === 0 ? (
              <p className="text-xs text-slate-500 rounded-xl bg-slate-50 p-4 text-center font-medium border border-dashed border-slate-200">No notifications yet.</p>
            ) : (
              items.map((item) => {
                // It is "read" if the backend says it isn't unread, OR if we just clicked it locally
                const isRead = !item.isUnread || localReadIds.has(item.id);
                
                return (
                  <article key={item.id} className={`rounded-xl border p-3 transition-colors ${!isRead ? 'bg-white border-violet-100 shadow-sm' : 'bg-slate-50/60 border-slate-100 opacity-75'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${!isRead ? 'text-slate-900' : 'text-slate-700'}`}>{item.title}</p>
                        <p className={`text-xs mt-1 line-clamp-2 ${!isRead ? 'text-slate-600' : 'text-slate-500'}`}>{item.description}</p>
                        <p className="text-[11px] text-slate-400 mt-2 font-medium">{item.createdAt}</p>
                      </div>
                      <div className="shrink-0 mt-1">
                        {!isRead ? <Dot className="w-6 h-6 text-rose-500 -ml-2" /> : <CircleCheck className="w-4 h-4 text-emerald-500 mt-0.5" />}
                      </div>
                    </div>
                    {!isRead && (
                      <button onClick={() => markRead(item.id)} className="mt-3 w-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-lg transition-colors">
                        Mark as read
                      </button>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}