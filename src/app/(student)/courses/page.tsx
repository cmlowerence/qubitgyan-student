'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Compass, Loader2, Search, ArrowRight } from 'lucide-react';
import { Course } from '@/types';
import { enrollInCourse, getMyCourses, getPublishedCourses } from '@/lib/learning';
import { useUi } from '@/components/providers/ui-provider';
import { cn } from '@/lib/utils';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop';

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
      try {
        const [published, mine] = await Promise.all([getPublishedCourses(), getMyCourses()]);
        setAllCourses(published);
        setMyCourseIds(new Set(mine.map((c) => c.id)));
      } catch {
        showAlert({ title: 'Error', message: 'Failed to load courses.', variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [showAlert]);

  const filteredCourses = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return allCourses;
    return allCourses.filter((c) => `${c.title} ${c.description || ''}`.toLowerCase().includes(term));
  }, [allCourses, query]);

  const handleEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    const ok = await enrollInCourse(courseId);
    if (ok) {
      setMyCourseIds((prev) => new Set(prev).add(courseId));
      showAlert({ title: 'Enrolled!', message: 'Course added to your profile.', variant: 'success' });
    } else {
      showAlert({ title: 'Enrollment failed', message: 'Please try again.', variant: 'error' });
    }
    setEnrollingId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Catalog...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <section className="rounded-[2.5rem] bg-gradient-to-r from-indigo-950 to-slate-900 p-8 md:p-12 shadow-xl mb-10 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Course Catalog</h1>
          <p className="text-indigo-200 text-lg font-medium mb-8">Discover structured learning tracks, enroll in new subjects, and elevate your preparation.</p>
          
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md px-5 py-4 border border-white/20 focus-within:bg-white/20 transition-all">
            <Search className="w-5 h-5 text-indigo-300 shrink-0" />
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search for subjects, topics, or keywords..." 
              className="w-full bg-transparent outline-none text-white placeholder:text-indigo-300/70 font-medium" 
            />
          </div>
        </div>
      </section>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
          <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No courses found</h3>
          <p className="text-slate-500 font-medium">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredCourses.map((course) => {
            const isEnrolled = myCourseIds.has(course.id);
            const bgImage = (course as any).thumbnail_url || (course as any).image || PLACEHOLDER_IMG;
            
            return (
              <article key={course.id} className="group relative overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-900 flex flex-col hover:shadow-2xl hover:shadow-indigo-900/20 transition-all duration-300 min-h-[360px]">
                <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-all duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${bgImage})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
                
                <div className="relative z-10 p-6 md:p-8 flex flex-col h-full justify-end">
                  <div className="w-14 h-14 rounded-[1.25rem] bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center mb-auto group-hover:bg-indigo-600 transition-colors shadow-lg">
                    <Compass className="w-7 h-7" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mt-6 leading-tight">{course.title}</h3>
                  <p className="text-sm text-slate-300 mt-3 line-clamp-2 font-medium">{course.description || 'Structured learning content available after enrollment.'}</p>
                  
                  <div className="mt-8 pt-6 border-t border-white/10">
                    {isEnrolled ? (
                      <Link href={`/courses/${(course as any).root_node || course.id}`} className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-bold text-slate-900 hover:bg-indigo-50 transition-colors shadow-lg active:scale-95">
                        Resume Learning <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <button onClick={() => handleEnroll(course.id)} disabled={enrollingId === course.id} className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white hover:bg-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg active:scale-95">
                        {enrollingId === course.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling...</> : 'Enroll Now'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}