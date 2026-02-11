'use client';

import Link from 'next/link';
import { ComponentType, useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { getChildren, getDomains, getProgressSummary } from '@/lib/learning';
import { KnowledgeNode } from '@/types';
import { ArrowRight, BookOpen, Flame, Layers, Trophy } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<KnowledgeNode[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [streak, setStreak] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const loadedTracks = await getDomains();
      setTracks(loadedTracks);
      const entries = await Promise.all(loadedTracks.map(async (track) => [track.id, (await getChildren(track.id)).length] as const));
      setCounts(Object.fromEntries(entries));
      const progress = await getProgressSummary();
      setStreak(progress.streakDays);
      setCompletedCount(progress.completedCount);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-[28px] bg-[linear-gradient(120deg,#111827,#4c1d95,#0f172a)] p-6 lg:p-10 text-white shadow-2xl">
        <p className="text-sm text-indigo-200">Welcome back</p>
        <h1 className="text-3xl lg:text-4xl font-black mt-1">{user?.first_name || 'Learner'}, your next chapter is ready.</h1>
        <p className="text-slate-200 mt-3 max-w-2xl">Fast, focused, and enjoyable study flow with videos, PDF notes, and progress tracking in one place.</p>
        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          <StatCard icon={BookOpen} label="Learning Tracks" value={tracks.length} />
          <StatCard icon={Flame} label="Active Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} />
          <StatCard icon={Trophy} label="Completed Resources" value={completedCount} />
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-violet-600" />
          <h2 className="text-xl font-bold text-slate-900">Continue your learning tracks</h2>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tracks.map((track, index) => (
            <Link key={track.id} href={`/courses/${track.id}`} className="group rounded-3xl border border-slate-200 bg-white p-5 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="h-36 rounded-2xl bg-gradient-to-br from-indigo-100 via-cyan-100 to-fuchsia-100 mb-4 flex items-center justify-center text-4xl font-black text-indigo-500">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="font-bold text-lg text-slate-900">{track.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{counts[track.id] ?? 0} subjects curated for this track.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-600">Start learning <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <Icon className="w-5 h-5 text-cyan-300" />
      <p className="text-xs text-slate-300 mt-2">{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}
