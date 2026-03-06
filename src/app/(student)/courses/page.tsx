// src/app/(student)/courses/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPublishedCourses, getMyCourses, enrollInCourse, getCourseProgress } from '@/lib/learning';
import { Course } from '@/types';
import { Compass, Search, Loader2 } from 'lucide-react';
import { useUi } from '@/components/providers/ui-provider';
import { useAuth } from '@/context/auth-context';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  
  const [progressMap, setProgressMap] = useState<Record<number, { total: number; completed: number; percent: number; rootNodeId?: number | null }>>({});
  
  const { showAlert } = useUi();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const all = await getPublishedCourses();
        setCourses(all);

        const mine = await getMyCourses();
        setMyCourses(mine);

        const progressPromises = mine.map(async (c) => {
          const meta = await getCourseProgress(c);
          return [c.id, meta] as const;
        });

        const results = await Promise.all(progressPromises);
        const map = Object.fromEntries(results.map(([id, v]) => [id, v]));
        setProgressMap(map as Record<number, { total: number; completed: number; percent: number; rootNodeId?: number | null }>);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) load();
  }, [user]);

  const filtered = courses.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  const handleEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    try {
      setCourses((s) => s.map((c) => (c.id === courseId ? { ...c, is_enrolled: true } : c)));
      
      const res = await enrollInCourse(courseId);
      
      if (!res) {
        setCourses((s) => s.map((c) => (c.id === courseId ? { ...c, is_enrolled: false } : c)));
        await showAlert({ title: 'Enrollment failed', message: 'Could not enroll — please try again.', variant: 'error' });
        return;
      }

      const mine = await getMyCourses();
      setMyCourses(mine);
      
      const newlyEnrolled = mine.find(c => c.id === courseId);
      if (newlyEnrolled) {
         const meta = await getCourseProgress(newlyEnrolled);
         setProgressMap(prev => ({...prev, [courseId]: meta}));
      }

      await showAlert({ title: 'Enrolled', message: 'You are now enrolled in this course.', variant: 'success' });
    } catch {
      await showAlert({ title: 'Error', message: 'An unexpected error occurred.', variant: 'error' });
    } finally {
      setEnrollingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-slate-500 flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 animate-spin text-violet-600"/> Loading your courses...</div>;
  }

  const getCourseUrl = (course: Course) => {
    const rootNodeId = progressMap[course.id]?.rootNodeId || (course as any).root_node;
    if (rootNodeId) return `/courses/${rootNodeId}`;
    return `/courses/${course.id}`;
  };

  return (
    <div className="space-y-8 pb-10 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <section className="rounded-3xl bg-white border border-slate-200 p-5 lg:p-7 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900">Explore Courses</h1>
        <p className="text-slate-500 mt-2 text-sm lg:text-base">Choose your course and jump into structured, media-rich learning.</p>

        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-slate-100 border border-slate-200 px-4 py-3 focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-violet-500 transition-all">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses..."
            className="bg-transparent outline-none text-sm w-full font-medium text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 px-1">My Enrolled Courses</h2>
        {myCourses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500 font-medium">
            You have no enrolled courses yet. Enroll from the list below to start learning.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {myCourses.map((course) => (
              <Link 
                key={course.id} 
                href={getCourseUrl(course)}
                className="group rounded-3xl border border-slate-200 bg-white p-5 lg:p-6 hover:shadow-xl hover:shadow-violet-900/5 hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 flex flex-col"
              >
                <div className="flex-1">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Compass className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-900 leading-tight group-hover:text-violet-700 transition-colors">{course.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">{(course as any).root_node_name || course.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-1000 ease-out" 
                      style={{ width: `${progressMap[course.id]?.percent ?? 0}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs font-semibold">
                    <span className="text-slate-900">{progressMap[course.id]?.percent ?? 0}% complete</span>
                    <span className="text-slate-500">{progressMap[course.id]?.completed ?? 0}/{progressMap[course.id]?.total ?? 0} resources</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 px-1">All Available Courses</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <article key={course.id} className="rounded-3xl border border-slate-200 bg-white p-5 lg:p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-5">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{course.title}</h3>
                <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">{course.description}</p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link href={getCourseUrl(course)} className="text-sm font-bold text-violet-600 hover:text-violet-700">View details</Link>
                
                {course.is_enrolled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 text-xs font-bold">
                    Enrolled
                  </span>
                ) : (
                  <button 
                    onClick={() => handleEnroll(course.id)} 
                    disabled={enrollingId === course.id}
                    className="rounded-xl bg-slate-900 text-white px-5 py-2.5 text-sm font-bold hover:bg-violet-600 transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {enrollingId === course.id && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enroll
                  </button>
                )}
              </div>
            </article>
          ))}
          
          {filtered.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-500">
              No courses found matching "{query}".
            </div>
          )}
        </div>
      </section>
    </div>
  );
}