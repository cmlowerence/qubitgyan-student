'use client';

import { Bell, CheckCheck, CircleCheck, Dot } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useUi } from '@/components/providers/ui-provider';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface NotificationCenterProps {
  items: NotificationItem[];
}

const READ_STORAGE_KEY = 'student_notifications_read';

export function NotificationCenter({ items }: NotificationCenterProps) {
  const { showAlert, showConfirm } = useUi();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as string[];
      setReadIds(new Set(parsed));
    } catch {
      setReadIds(new Set());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(readIds)));
  }, [readIds]);

  const unreadCount = useMemo(() => items.filter((item) => !readIds.has(item.id)).length, [items, readIds]);

  const markRead = (id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
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
      variant: 'warning',
    });

    if (!confirmed) return;

    setReadIds(new Set(items.map((item) => item.id)));
    await showAlert({
      title: 'Updated',
      message: 'All notifications are now marked as read.',
      variant: 'success',
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 relative"
        aria-label="Toggle notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 rounded-full bg-rose-500 text-white text-[10px] w-4 h-4 grid place-items-center">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[min(92vw,22rem)] rounded-2xl border border-slate-200 bg-white shadow-lg p-3 z-30">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-500">{unreadCount > 0 ? `${unreadCount} unread` : 'Everything is read'}</p>
            </div>
            <button onClick={markAllRead} className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 inline-flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>

          <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
            {items.length === 0 ? (
              <p className="text-xs text-slate-500 rounded-xl bg-slate-50 p-3">No notifications yet.</p>
            ) : (
              items.map((item) => {
                const isRead = readIds.has(item.id);
                return (
                  <article key={item.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50/60">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                        <p className="text-[11px] text-slate-400 mt-2">{item.createdAt}</p>
                      </div>
                      {!isRead ? <Dot className="w-5 h-5 text-rose-500 mt-0.5" /> : <CircleCheck className="w-4 h-4 text-emerald-500 mt-1" />}
                    </div>
                    {!isRead && (
                      <button onClick={() => markRead(item.id)} className="mt-2 text-xs font-semibold text-slate-700 hover:text-slate-900">
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
