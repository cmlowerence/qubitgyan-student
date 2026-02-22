'use client';

import { useEffect, useState } from 'react';
import { getTracking } from '@/lib/learning';
import { formatDateTime } from '@/lib/app-utils';

export default function TrackingPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    getTracking().then(setRows);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900 mb-4">Learning Tracking</h1>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Resource</th>
              <th className="text-left p-3">Completed</th>
              <th className="text-left p-3">Last Accessed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="p-3">#{row.resource}</td>
                <td className="p-3">{row.is_completed ? 'Yes' : 'No'}</td>
                <td className="p-3">{formatDateTime(row.last_accessed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
