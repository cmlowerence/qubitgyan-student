'use client';

import { useEffect, useState } from 'react';
import { Bookmark, CheckCircle2, Clock3, Loader2 } from 'lucide-react';
import { getBookmarks, getTracking } from '@/lib/learning';

interface ResourceRow {
  id: number;
  title: string;
  type: string;
  completed: boolean;
  lastAccessed?: string;
}

export default function ResourcesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<ResourceRow[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [bookmarks, tracking] = await Promise.all([getBookmarks(), getTracking()]);
      const trackingByResource = new Map(tracking.map((item) => [item.resource, item]));

      setRows(
        bookmarks.map((bookmark) => {
          const progress = trackingByResource.get(bookmark.resource);
          return {
            id: bookmark.id,
            title: bookmark.resource_title,
            type: bookmark.resource_type,
            completed: Boolean(progress?.is_completed),
            lastAccessed: progress?.last_accessed,
          };
        }),
      );
      setIsLoading(false);
    };

    load();
  }, []);

  if (isLoading) {
    return <div className="min-h-[40vh] grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-5 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-black text-slate-900">Resources</h1>
        <p className="text-sm text-slate-500 mt-1">All your bookmarked study resources in one place.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No bookmarks yet. Add resources from course pages to see them here.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => (
              <li key={row.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{row.title}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mt-1">{row.type}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${row.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {row.completed ? <CheckCircle2 className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    {row.completed ? 'Completed' : 'Saved'}
                  </span>
                  {row.lastAccessed ? <span className="text-slate-500 inline-flex items-center gap-1"><Clock3 className="w-4 h-4" />{new Date(row.lastAccessed).toLocaleDateString()}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
