'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCourses, getMyCourses, enrollInCourse } from '@/lib/courses';
import { Course } from '@/types';
import { Compass, Search } from 'lucide-react';
import { useUi } from '@/components/providers/ui-provider';
import { useAuth } from '@/context/auth-context';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const { showAlert } = useUi();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      const all = await getCourses();
      setCourses(all);

      // fetch enrolled list separately (backend action)
      const mine = await getMyCourses();
      setMyCourses(mine);

      // compute per-course progress (parallelized)
      const progressPromises = all.map(async (c) => {
        const meta = await getCourseProgress(c);
        return [c.id, meta] as const;
      });

      const results = await Promise.all(progressPromises);
      const map = Object.fromEntries(results.map(([id, v]) => [id, v]));
      setProgressMap(map as Record<number, { total: number; completed: number; percent: number; rootNodeId?: number | null }>);
    };
    load();
  }, [user]);

  const filtered = courses.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  const handleEnroll = async (courseId: number) => {
    const prev = courses.slice();
    setCourses((s) => s.map((c) => (c.id === courseId ? { ...c, is_enrolled: true } : c)));
    const res = await enrollInCourse(courseId);
    if (!res) {
      setCourses(prev);
      await showAlert({ title: 'Enrollment failed', message: 'Could not enroll — please try again.', variant: 'error' });
      return;
    }

    // refresh myCourses
    const mine = await getMyCourses();
    setMyCourses(mine);
    await showAlert({ title: 'Enrolled', message: 'You are now enrolled in this course.', variant: 'success' });
  };

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-3xl bg-white border border-slate-200 p-5 lg:p-7">
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900">Explore Courses</h1>
        <p className="text-slate-500 mt-2">Choose your course and jump into structured, media-rich learning.</p>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-100 border border-slate-200 px-4 py-3">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </section>

      {/* My courses */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-3">My courses</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {myCourses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">You have no enrolled courses yet. Enroll from the list below.</div>
          ) : (
            myCourses.map((course) => (
              <Link key={course.id} href={progressMap[course.id]?.rootNodeId ? `/courses/${progressMap[course.id]!.rootNodeId}` : `/courses/${course.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">{course.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{course.root_node_name || course.description}</p>

                <div className="mt-4">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-cyan-600" style={{ width: `${progressMap[course.id]?.percent ?? 0}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{progressMap[course.id]?.percent ?? 0}% complete • {progressMap[course.id]?.completed ?? 0}/{progressMap[course.id]?.total ?? 0} resources</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* All courses */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-3">All courses</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <article key={course.id} className="rounded-3xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-3">{course.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <Link href={`/courses/${course.id}`} className="text-sm font-semibold text-violet-600">Open course</Link>
                {course.is_enrolled ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold">Enrolled</span>
                ) : (
                  <button onClick={() => handleEnroll(course.id)} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800">Enroll</button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
