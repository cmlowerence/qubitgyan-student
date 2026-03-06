// src/app/(student)/courses/[domainId]/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getChildren, getNode } from '@/lib/learning';
import { KnowledgeNode } from '@/types';
import { ChevronRight, LibraryBig, Loader2 } from 'lucide-react';

export default function SubjectSelectionPage() {
  const params = useParams();
  const domainId = Number(params.domainId);
  const [domain, setDomain] = useState<KnowledgeNode | null>(null);
  const [subjects, setSubjects] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!domainId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [domainData, subjectsData] = await Promise.all([
          getNode(domainId),
          getChildren(domainId)
        ]);
        setDomain(domainData);
        setSubjects(subjectsData);
        console.log("Fetched subjects:", subjectsData);
        console.log("Domain data:", domainData);
        console.log("Domain ID:", domainId);
      } catch (err) {
        console.error("Failed to load subjects", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [domainId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
        <p>Loading course modules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <section className="rounded-3xl p-6 lg:p-8 border border-slate-200 bg-white">
        <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-1">Track Overview</p>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">{domain?.name || 'Course Curriculum'}</h1>
        <p className="mt-3 text-slate-500 text-sm md:text-base max-w-2xl">Select a module below to open the interactive explorer and begin your learning journey.</p>
      </section>

      {subjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500 bg-white">
          No learning modules have been added to this track yet. Check back soon!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject) => (
            <Link
              href={`/courses/${domainId}/${subject.id}`}
              key={subject.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 lg:p-6 hover:shadow-lg hover:border-cyan-300 transition-all duration-300 group flex flex-col justify-between min-h-[180px]"
            >
              <div>
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:bg-cyan-100 transition-colors">
                    <LibraryBig className="w-6 h-6" />
                  </div>
                  <h2 className="font-bold text-lg md:text-xl leading-tight text-slate-800 group-hover:text-cyan-800 transition-colors pt-1">{subject.name}</h2>
                </div>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-600 group-hover:text-cyan-700">
                Enter Module <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}