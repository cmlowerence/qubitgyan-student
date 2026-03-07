'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react';
import { getTracking } from '@/lib/learning';
import { TrackingPayload } from '@/lib/student-api';

export default function TrackingPage() {
  const [items, setItems] = useState<TrackingPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await getTracking();
      setItems(data);
      setIsLoading(false);
    };

    load();
  }, []);

  const summary = useMemo(() => {
    const completed = items.filter((item) => item.is_completed).length;
    return {
      completed,
      pending: Math.max(items.length - completed, 0),
    };
  }, [items]);

  return (
    <div className="space-y-5 pb-8">
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700">Completed</p>
          <p className="text-3xl font-black text-emerald-900 mt-1">{summary.completed}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-700">Pending</p>
          <p className="text-3xl font-black text-amber-900 mt-1">{summary.pending}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-10 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No tracking records available yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">Resource #{item.resource}</p>
                  <p className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" />{new Date(item.last_accessed).toLocaleString()}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${item.is_completed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {item.is_completed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {item.is_completed ? 'Completed' : 'In progress'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
