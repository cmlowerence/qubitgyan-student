'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpenCheck, Clock3, Flame, GraduationCap, Trophy } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Course, KnowledgeNode } from '@/types';
import { getDomains, getMyCourses, getProgressSummary, getQuizAttempts } from '@/lib/learning';

export default function DashboardPage() {
  const { user } = useAuth();

  const [domains, setDomains] = useState<KnowledgeNode[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedResources, setCompletedResources] = useState(0);
  const [recentActivity, setRecentActivity] = useState(0);
  const [quizCount, setQuizCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [domainData, myCourses, progress, attempts] = await Promise.all([
        getDomains(),
        getMyCourses(),
        getProgressSummary(),
        getQuizAttempts(),
      ]);

      setDomains(domainData);
      setCourses(myCourses);
      setCompletedResources(progress.completedCount);
      setRecentActivity(progress.recent.length);
      setQuizCount(attempts.length);
    };

    load();
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-3xl bg-[linear-gradient(120deg,#0f172a,#312e81,#0b1120)] p-6 md:p-8 text-white">
        <p className="text-indigo-100">Hello, {user?.first_name || 'Student'}</p>
        <h1 className="mt-2 text-2xl md:text-4xl font-black">Your learning control center</h1>
        <p className="mt-3 max-w-2xl text-indigo-100/90 text-sm md:text-base">Everything is synced with your authorized student account: courses, resources, quizzes, and progress tracking.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Enrolled Courses" value={courses.length} icon={GraduationCap} />
          <Stat label="Completed Resources" value={completedResources} icon={BookOpenCheck} />
          <Stat label="Quiz Attempts" value={quizCount} icon={Trophy} />
          <Stat label="Recent Activity" value={recentActivity} icon={Clock3} />
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-xl font-black text-slate-900">Learning tracks</h2>
          <p className="mt-1 text-sm text-slate-500">Browse all available tracks and continue from where you left off.</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {domains.slice(0, 6).map((domain) => (
              <Link key={domain.id} href={`/courses/${domain.id}`} className="rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:bg-indigo-50/40 transition">
                <p className="text-sm text-slate-500">{domain.node_type}</p>
                <p className="font-bold text-slate-900 mt-1">{domain.name}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">Open <ArrowRight className="w-4 h-4" /></span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-black text-slate-900">Quick actions</h3>
          <div className="mt-4 space-y-3">
            <QuickLink href="/courses" label="Explore Courses" />
            <QuickLink href="/resources" label="My Saved Resources" />
            <QuickLink href="/assessments" label="Take an Assessment" />
            <QuickLink href="/profile" label="Profile & Password" />
          </div>
          <div className="mt-6 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900 flex gap-2">
            <Flame className="w-4 h-4 mt-0.5" />
            Keep your streak active by opening at least one resource each day.
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
      <Icon className="w-5 h-5 text-indigo-200" />
      <p className="text-xs text-indigo-100 mt-2">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700">
      {label}
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}
