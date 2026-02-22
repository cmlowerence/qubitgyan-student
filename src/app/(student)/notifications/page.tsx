'use client';

import { useEffect, useState } from 'react';
import { getNotifications, markAllNotificationsRead } from '@/lib/learning';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    getNotifications().then(setItems);
  }, []);

  const markAll = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
        <button onClick={markAll} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>
      <div className="grid gap-3">
        {items.map((n) => (
          <article key={n.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-violet-600" />
              <p className="font-semibold">{n.title}</p>
            </div>
            <p className="text-sm text-slate-600 mt-2">{n.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
