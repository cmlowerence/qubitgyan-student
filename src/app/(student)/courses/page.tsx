'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Compass, Loader2, Search } from 'lucide-react';
import { Course } from '@/types';
import { enrollInCourse, getMyCourses, getPublishedCourses } from '@/lib/learning';
import { useUi } from '@/components/providers/ui-provider';

export default function CoursesPage() {
  const { showAlert } = useUi();
  const [isLoading, setIsLoading] = useState(true);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [myCourseIds, setMyCourseIds] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState('');
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [published, mine] = await Promise.all([getPublishedCourses(), getMyCourses()]);
      setAllCourses(published);
      setMyCourseIds(new Set(mine.map((course) => course.id)));
      setIsLoading(false);
    };

    load();
  }, []);

  const filteredCourses = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return allCourses;

    return allCourses.filter((course) =>
      `${course.title} ${course.description || ''}`.toLowerCase().includes(term),
    );
  }, [allCourses, query]);

  const handleEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    const ok = await enrollInCourse(courseId);

    if (ok) {
      setMyCourseIds((prev) => new Set(prev).add(courseId));
      showAlert({ title: 'Enrollment successful', message: 'Course is now added to your profile.', variant: 'success' });
    } else {
      showAlert({ title: 'Enrollment failed', message: 'Please try again in a moment.', variant: 'error' });
    }

    setEnrollingId(null);
  };

  if (isLoading) {
    return <div className="min-h-[40vh] grid place-items-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-black text-slate-900">Courses</h1>
        <p className="text-sm text-slate-500 mt-1">Fully responsive catalog synced from student APIs.</p>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title or description" className="w-full bg-transparent outline-none text-sm" />
        </div>
      </section>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCourses.map((course) => {
          const isEnrolled = myCourseIds.has(course.id);
          return (
            <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 grid place-items-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 mt-4">{course.title}</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-3">{course.description || 'Structured learning content available after enrollment.'}</p>
              <div className="mt-5 pt-4 border-t border-slate-100">
                {isEnrolled ? (
                  <Link href={`/courses/${(course as any).root_node || course.id}`} className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">
                    Continue Course
                  </Link>
                ) : (
                  <button onClick={() => handleEnroll(course.id)} disabled={enrollingId === course.id} className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                    {enrollingId === course.id ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
