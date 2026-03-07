'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { getNotifications, markAllNotificationsRead } from '@/lib/learning';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await getNotifications();
      setItems(data as NotificationItem[]);
      setIsLoading(false);
    };

    load();
  }, []);

  const markAllRead = async () => {
    setMarking(true);
    await markAllNotificationsRead();
    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setMarking(false);
  };

  return (
    <div className="space-y-5 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Course updates, alerts, and personalized student messages.</p>
        </div>
        <button onClick={markAllRead} disabled={marking} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60 inline-flex items-center gap-2">
          <CheckCheck className="w-4 h-4" />
          {marking ? 'Updating...' : 'Mark all read'}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-10 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No notifications at the moment.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="p-4 sm:p-5 flex gap-3">
                <Bell className={`w-5 h-5 mt-1 ${item.is_read ? 'text-slate-300' : 'text-indigo-600'}`} />
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
