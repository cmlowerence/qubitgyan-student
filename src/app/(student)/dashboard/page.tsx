'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  BookOpenCheck, 
  Clock3, 
  Flame, 
  GraduationCap, 
  Trophy, 
  Compass, 
  Bookmark, 
  Target, 
  UserCircle 
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Course, KnowledgeNode } from '@/types';
import { getDomains, getMyCourses, getProgressSummary, getQuizAttempts } from '@/lib/learning';
import { cn } from '@/lib/utils';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop';

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
    <div className="min-h-screen bg-slate-50 pb-12 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-12 shadow-2xl shadow-indigo-900/20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

          <div className="relative z-10 text-white">
            <p className="text-indigo-200 font-bold tracking-wide uppercase text-sm mb-2">
              Welcome back, {user?.first_name || 'Student'}
            </p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Your learning <br className="hidden sm:block"/> control center.
            </h1>
            <p className="mt-4 max-w-2xl text-indigo-100/80 text-base md:text-lg font-medium leading-relaxed">
              Everything is synced with your authorized student account: courses, resources, assessments, and progress tracking.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Enrolled Courses" value={courses.length} icon={GraduationCap} />
              <Stat label="Completed Resources" value={completedResources} icon={BookOpenCheck} />
              <Stat label="Quiz Attempts" value={quizCount} icon={Trophy} />
              <Stat label="Recent Activity" value={recentActivity} icon={Clock3} />
            </div>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <section className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Learning Tracks */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Learning Tracks</h2>
                <p className="text-slate-500 font-medium mt-1">Jump right back into your active modules.</p>
              </div>
              <Link href="/courses" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {domains.slice(0, 6).map((domain) => {
                const bgImage = (domain as any).thumbnail_url || (domain as any).image || PLACEHOLDER_IMG;

                return (
                  <Link 
                    key={domain.id} 
                    href={`/courses/${domain.id}`} 
                    className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 flex flex-col justify-end min-h-[220px] hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${bgImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                    
                    <div className="relative z-10 p-6 flex flex-col h-full">
                      <div className="mb-auto">
                        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/20 shadow-sm">
                          {domain.node_type}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-xl leading-tight text-white group-hover:text-indigo-300 transition-colors">
                          {domain.name}
                        </h3>
                        <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-indigo-400 group-hover:text-indigo-300">
                          Open Module <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Quick Actions & Streak */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <QuickLink href="/courses" label="Explore Courses" icon={Compass} />
                <QuickLink href="/resources" label="Saved Resources" icon={Bookmark} />
                <QuickLink href="/quiz" label="Take an Assessment" icon={Target} />
                <QuickLink href="/profile" label="Profile Settings" icon={UserCircle} />
              </div>
              
              <div className="mt-8 rounded-[1.5rem] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-5 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-colors" />
                <div className="flex items-start gap-3 relative z-10">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Keep your streak alive!</p>
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      Open at least one resource or attempt a quiz today to maintain your learning streak.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 backdrop-blur-md p-5 flex items-start gap-4 hover:bg-white/10 transition-colors group">
      <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-300 group-hover:bg-indigo-500/30 group-hover:text-indigo-200 transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
        <p className="text-xs font-semibold text-indigo-200/80 uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link 
      href={href} 
      className="group flex items-center justify-between rounded-[1.25rem] border border-slate-100 bg-slate-50 px-4 py-3.5 transition-all hover:bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-900/5"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors shadow-sm">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{label}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}