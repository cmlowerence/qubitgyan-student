'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDomains } from '@/lib/learning';
import { KnowledgeNode } from '@/types';
import { Compass, Search } from 'lucide-react';

export default function CoursesPage() {
  const [tracks, setTracks] = useState<KnowledgeNode[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getDomains().then(setTracks);
  }, []);

  const filtered = tracks.filter((track) => track.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-3xl bg-white border border-slate-200 p-5 lg:p-7">
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900">Explore Courses</h1>
        <p className="text-slate-500 mt-2">Choose your track and jump into structured, media-rich learning.</p>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-100 border border-slate-200 px-4 py-3">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search track..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </section>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((track) => (
          <Link
            href={`/courses/${track.id}`}
            key={track.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold">{track.name}</h2>
            <p className="text-sm text-slate-500 mt-1">Start curated pathways, notes, and tests.</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
